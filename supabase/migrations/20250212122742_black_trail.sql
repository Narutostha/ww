/*
  # Create Admin User and Update Policies

  1. Changes
    - Create admin user in auth.users
    - Create admin record in admins table
    - Update RLS policies for products and orders

  2. Security
    - Create proper auth user for admin
    - Set up secure RLS policies
*/

-- First, let's clean up existing data
DELETE FROM admins WHERE email = 'admin@example.com';

-- Create a function to create an admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email text,
  admin_password text,
  admin_name text,
  admin_role text
) RETURNS void AS $$
DECLARE
  auth_user_id uuid;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('name', admin_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO auth_user_id;

  -- Create admin record
  INSERT INTO admins (id, email, password, name, role)
  VALUES (
    auth_user_id,
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    admin_name,
    admin_role::admin_role
  );
END;
$$ LANGUAGE plpgsql;

-- Create the admin user
SELECT create_admin_user(
  'admin@example.com',
  'admin123',
  'Admin User',
  'SUPER_ADMIN'
);

-- Update RLS policies
DROP POLICY IF EXISTS "Enable write access for admins" ON products;
DROP POLICY IF EXISTS "Enable read access for admins" ON orders;
DROP POLICY IF EXISTS "Enable write access for admins" ON orders;

-- Create new policies
CREATE POLICY "Enable write access for admins"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Enable access for admins"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));