-- Create a trigger to automatically create a restaurant profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into restaurants table using the auth user's id
  INSERT INTO public.restaurants (id, name, email, default_language)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Mi Restaurante'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'default_language', 'es')
  )
  ON CONFLICT (id) DO NOTHING;

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
