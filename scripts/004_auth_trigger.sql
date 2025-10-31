-- Create a trigger to automatically create a restaurant profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_id UUID;
BEGIN
  -- Check if user has a referral code in metadata
  IF new.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    -- Find the referrer by referral code
    SELECT id INTO referrer_id
    FROM public.restaurants
    WHERE referral_code = UPPER(new.raw_user_meta_data->>'referral_code');
  END IF;

  -- Insert into restaurants table using the auth user's id
  INSERT INTO public.restaurants (id, name, email, default_language, phone, address, referred_by)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Mi Restaurante'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'default_language', 'es'),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address',
    referrer_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create referral record if referrer exists
  IF referrer_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, status)
    VALUES (referrer_id, new.id, 'pending')
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
