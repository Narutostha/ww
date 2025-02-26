/*
  # Fix Admin Authentication

  1. Changes
    - Clean up existing policies
    - Update RLS policies for products and orders
    - Create function to handle admin user creation
    - Create initial admin user if not exists

  2. Security
    - Proper admin authentication
    - Secure RLS policies
*/

-- First, clean up existing policies
DROP POLICY IF EXISTS "Enable write access for admins" ON products;
DROP POLICY IF EXISTS "Enable read access for admins" ON orders;
DROP POLICY IF EXISTS "Enable write access for admins" ON orders;
DROP POLICY IF EXISTS "Enable access for admins" ON orders;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Public can view products" ON products;

-- Create function to check if admin exists
CREATE OR REPLACE FUNCTION admin_exists(admin_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE email = admin_email
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get auth user id
CREATE OR REPLACE FUNCTION get_auth_user_id(admin_email text)
RETURNS uuid AS $$
DECLARE
  auth_user_id uuid;
BEGIN
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = admin_email;
  RETURN auth_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create admin user if not exists
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Only proceed if admin doesn't exist
  IF NOT admin_exists('admin@example.com') THEN
    -- Get existing auth user or null
    admin_user_id := get_auth_user_id('admin@example.com');
    
    -- If no auth user exists, create one
    IF admin_user_id IS NULL THEN
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@example.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"name": "Admin User"}'::jsonb,
        now(),
        now()
      )
      RETURNING id INTO admin_user_id;
    END IF;

    -- Create admin record
    INSERT INTO admins (
      id,
      email,
      password,
      name,
      role
    ) VALUES (
      admin_user_id,
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      'Admin User',
      'SUPER_ADMIN'
    );
  END IF;
END $$;

-- Update RLS policies for products
CREATE POLICY "Enable write access for admins"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Update RLS policies for orders
CREATE POLICY "Enable access for admins"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));