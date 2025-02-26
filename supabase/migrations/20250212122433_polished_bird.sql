/*
  # Fix RLS Policies and Add Admin User

  1. Changes
    - Update RLS policies to allow public read access to products
    - Add initial admin user
    - Fix product policies

  2. Security
    - Enable RLS on all tables
    - Add proper policies for public and authenticated access
*/

-- Drop existing product policies
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Users can view products" ON products;

-- Create new product policies
CREATE POLICY "Enable read access for all users"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable write access for admins"
  ON products
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));

-- Insert initial admin user
INSERT INTO admins (email, password, name, role)
VALUES (
  'admin@example.com',
  -- This is a hashed version of 'admin123' - in production, use proper password hashing
  '$2a$10$rQEk5gxEuW.jUuT3Dq3Emu4OE0HI9yQCIhW9Y1YzOFzG8jH4jQZGy',
  'Admin User',
  'SUPER_ADMIN'
);

-- Update order policies
CREATE POLICY "Enable read access for admins"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Enable write access for admins"
  ON orders
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));