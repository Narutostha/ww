-- Add photos column to products table
ALTER TABLE products 
ADD COLUMN photos text[] DEFAULT '{}';

-- Update existing products to have empty photos array
UPDATE products 
SET photos = '{}' 
WHERE photos IS NULL;

-- Add NOT NULL constraint
ALTER TABLE products 
ALTER COLUMN photos SET NOT NULL;

-- Update RLS policies to include photos
DROP POLICY IF EXISTS "Enable write access for admins" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;

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