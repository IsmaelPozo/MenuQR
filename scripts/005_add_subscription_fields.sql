-- Add subscription and payment fields to restaurants table
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'trialing' 
    CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS monthly_fee DECIMAL(10,2) DEFAULT 25.00,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_connect_account_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS payment_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bank_account_last4 VARCHAR(4),
ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(255);

-- Create subscription history table for tracking payments
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for subscription payments
CREATE INDEX IF NOT EXISTS idx_subscription_payments_restaurant ON public.subscription_payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON public.subscription_payments(status);

-- Function to calculate trial end date (3 months from start)
CREATE OR REPLACE FUNCTION calculate_trial_end_date(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN start_date + INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate proportional monthly fee
CREATE OR REPLACE FUNCTION calculate_proportional_fee(
    base_fee DECIMAL,
    start_date TIMESTAMP WITH TIME ZONE
)
RETURNS DECIMAL AS $$
DECLARE
    days_in_month INTEGER;
    days_remaining INTEGER;
    proportional_fee DECIMAL;
BEGIN
    -- Get total days in the month
    days_in_month := EXTRACT(DAY FROM (DATE_TRUNC('month', start_date) + INTERVAL '1 month' - INTERVAL '1 day'));
    
    -- Get remaining days in the month (including start date)
    days_remaining := days_in_month - EXTRACT(DAY FROM start_date) + 1;
    
    -- Calculate proportional fee
    proportional_fee := (base_fee / days_in_month) * days_remaining;
    
    RETURN ROUND(proportional_fee, 2);
END;
$$ LANGUAGE plpgsql;

-- Update existing restaurants to set trial end date
UPDATE public.restaurants
SET trial_end_date = calculate_trial_end_date(subscription_start_date)
WHERE trial_end_date IS NULL;
