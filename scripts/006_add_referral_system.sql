-- Add referral fields to restaurants table
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_discount DECIMAL(10,2) DEFAULT 0.00;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    discount_amount DECIMAL(10,2) DEFAULT 2.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(referrer_id, referred_id)
);

-- Create index for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_code VARCHAR(20);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-character code (uppercase letters and numbers)
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.restaurants WHERE referral_code = new_code) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate referral discount (max 10€ to reach minimum of 15€)
CREATE OR REPLACE FUNCTION calculate_referral_discount(restaurant_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    active_referrals INTEGER;
    discount DECIMAL;
    max_discount DECIMAL := 10.00;
    discount_per_referral DECIMAL := 2.00;
BEGIN
    -- Count active referrals (where referred restaurant is paying)
    SELECT COUNT(*) INTO active_referrals
    FROM public.referrals
    WHERE (referrer_id = restaurant_id OR referred_id = restaurant_id)
    AND status = 'active';
    
    -- Calculate discount (2€ per referral, max 10€)
    discount := LEAST(active_referrals * discount_per_referral, max_discount);
    
    RETURN discount;
END;
$$ LANGUAGE plpgsql;

-- Function to update referral discounts for a restaurant
CREATE OR REPLACE FUNCTION update_referral_discount(restaurant_id UUID)
RETURNS VOID AS $$
DECLARE
    new_discount DECIMAL;
BEGIN
    new_discount := calculate_referral_discount(restaurant_id);
    
    UPDATE public.restaurants
    SET referral_discount = new_discount
    WHERE id = restaurant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to activate referral when referred restaurant starts paying
CREATE OR REPLACE FUNCTION activate_referral(referred_restaurant_id UUID)
RETURNS VOID AS $$
DECLARE
    referrer_restaurant_id UUID;
BEGIN
    -- Get referrer
    SELECT referred_by INTO referrer_restaurant_id
    FROM public.restaurants
    WHERE id = referred_restaurant_id;
    
    IF referrer_restaurant_id IS NOT NULL THEN
        -- Update referral status to active
        UPDATE public.referrals
        SET status = 'active', activated_at = NOW()
        WHERE referred_id = referred_restaurant_id;
        
        -- Update referral counts
        UPDATE public.restaurants
        SET referral_count = referral_count + 1
        WHERE id = referrer_restaurant_id;
        
        -- Update discounts for both restaurants
        PERFORM update_referral_discount(referrer_restaurant_id);
        PERFORM update_referral_discount(referred_restaurant_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Generate referral codes for existing restaurants
UPDATE public.restaurants
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Trigger to generate referral code for new restaurants
CREATE OR REPLACE FUNCTION trigger_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_restaurant_referral_code
BEFORE INSERT ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_referral_code();
