-- Add payment tracking fields to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_fully_paid BOOLEAN DEFAULT FALSE;

-- Update status check constraint to include pending_payment
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending_payment', 'received', 'preparing', 'ready', 'served', 'paid'));

-- Add payment tracking to order items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS paid_by VARCHAR(255);

-- Create order payments table to track individual payment transactions
CREATE TABLE IF NOT EXISTS public.order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('individual', 'table', 'partial')),
    stripe_payment_intent_id VARCHAR(255),
    customer_name VARCHAR(255),
    paid_item_ids UUID[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_payments_order ON public.order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_table ON public.order_payments(table_id);

-- Function to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order's amount_paid
    UPDATE public.orders
    SET 
        amount_paid = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.order_payments
            WHERE order_id = NEW.order_id AND status = 'completed'
        ),
        is_fully_paid = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.order_payments
            WHERE order_id = NEW.order_id AND status = 'completed'
        ) >= total_amount,
        status = CASE 
            WHEN (
                SELECT COALESCE(SUM(amount), 0)
                FROM public.order_payments
                WHERE order_id = NEW.order_id AND status = 'completed'
            ) >= total_amount THEN 'received'
            ELSE status
        END
    WHERE id = NEW.order_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment status updates
DROP TRIGGER IF EXISTS trigger_update_order_payment_status ON public.order_payments;
CREATE TRIGGER trigger_update_order_payment_status
    AFTER INSERT OR UPDATE ON public.order_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_order_payment_status();
