/*
  # Admin User and Policies Migration

  1. Changes
    - Create admin record
    - Update RLS policies for products and orders
    - Set up proper access control

  2. Security
    - Secure admin access
    - Updated RLS policies
*/

-- First, clean up existing data and policies
DELETE FROM admins WHERE email = 'admin@example.com';
DROP POLICY IF EXISTS "Enable write access for admins" ON products;
DROP POLICY IF EXISTS "Enable read access for admins" ON orders;
DROP POLICY IF EXISTS "Enable write access for admins" ON orders;
DROP POLICY IF EXISTS "Enable access for admins" ON orders;

-- Create admin record
INSERT INTO admins (
  id,
  email,
  password,
  name,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  'Admin User',
  'SUPER_ADMIN'
);

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