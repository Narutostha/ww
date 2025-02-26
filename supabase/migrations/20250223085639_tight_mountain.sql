-- Add main_image column to products table
ALTER TABLE products 
ADD COLUMN main_image text;

-- Copy existing image values to main_image
UPDATE products 
SET main_image = image;

-- Make main_image NOT NULL after data migration
ALTER TABLE products 
ALTER COLUMN main_image SET NOT NULL;

-- Rename old image column to featured_image
ALTER TABLE products 
RENAME COLUMN image TO featured_image;

-- Update RLS policies to include main_image
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