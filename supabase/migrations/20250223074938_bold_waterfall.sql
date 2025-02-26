/*
  # Add soft delete functionality to products

  1. Changes
    - Add `deleted_at` column to products table
    - Update policies to exclude deleted products from public view
    - Add function to soft delete products
    - Add trigger to prevent hard deletion of products

  2. Security
    - Maintain RLS policies
    - Only allow admins to soft delete products
*/

-- Add deleted_at column to products
ALTER TABLE products
ADD COLUMN deleted_at timestamptz;

-- Create function to soft delete products
CREATE OR REPLACE FUNCTION soft_delete_product()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE id = OLD.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle delete attempts
CREATE TRIGGER trigger_soft_delete_product
  BEFORE DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_product();

-- Update policies to exclude deleted products
DROP POLICY IF EXISTS "Enable write access for admins" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;

CREATE POLICY "Enable write access for admins"
  ON products
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admins) AND
    deleted_at IS NULL
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admins) AND
    deleted_at IS NULL
  );

CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);