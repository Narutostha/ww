/*
  # Fix Admin Authentication and Policies

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create proper admin authentication
    - Set up correct RLS policies
    - Fix UUID comparison issues
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can view all admin records" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admin records" ON admins;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id::text = auth.uid()::text 
    AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for products
CREATE POLICY "products_public_read"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "products_admin_all"
  ON products
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create policies for admins
CREATE POLICY "admins_read_all"
  ON admins
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "admins_super_manage"
  ON admins
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Create initial super admin if not exists
DO $$
DECLARE
  admin_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@example.com'
  ) INTO admin_exists;

  IF NOT admin_exists THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
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
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Admin User"}'::jsonb,
      now(),
      now()
    );
  END IF;
END $$;

-- Ensure admin record exists
DO $$
DECLARE
  auth_user_id uuid;
BEGIN
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = 'admin@example.com';

  IF NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@example.com') THEN
    INSERT INTO admins (id, email, password, name, role)
    VALUES (
      auth_user_id,
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      'Admin User',
      'SUPER_ADMIN'
    );
  END IF;
END $$;