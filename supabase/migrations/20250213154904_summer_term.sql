/*
  # Fix Admin Security Setup

  1. Changes
    - Fix syntax error in ENABLE ROW LEVEL SECURITY command
    - Update RLS policies for better security
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all admin records" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admin records" ON admins;

-- Fix RLS syntax
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Admins can view all admin records"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

CREATE POLICY "Super admins can manage admin records"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM admins WHERE role = 'SUPER_ADMIN'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM admins WHERE role = 'SUPER_ADMIN'
    )
  );

-- Update product policies to work with admin authentication
DROP POLICY IF EXISTS "Enable write access for admins" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage products"
  ON products
  USING (auth.uid() IN (SELECT id FROM admins))
  WITH CHECK (auth.uid() IN (SELECT id FROM admins));