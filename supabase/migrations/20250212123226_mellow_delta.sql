/*
  # Fix Admin Policies

  1. Changes
    - Clean up existing policies
    - Update product and order policies
    - Ensure proper admin access control

  2. Security
    - Proper RLS policies for admin access
    - Public read access for products
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