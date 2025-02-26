-- First ensure we have a clean slate
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_color_format;

  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS trigger_soft_delete_product ON products;
  
  -- Drop existing function if it exists
  DROP FUNCTION IF EXISTS soft_delete_product();
END $$;

-- Create temporary table for new structure
CREATE TABLE products_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text[] NOT NULL DEFAULT '{}',
  price decimal(10,2) NOT NULL,
  image text NOT NULL,
  photos text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT '{}',
  color text[] NOT NULL DEFAULT ARRAY['#000000'],
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Copy data from old table to new table
INSERT INTO products_new (
  id, name, description, price, image, sizes, color, stock, 
  created_at, updated_at, deleted_at
)
SELECT 
  id, name, description, price, image, sizes, color, stock,
  created_at, updated_at, deleted_at
FROM products;

-- Update foreign key references
ALTER TABLE cart_items
ADD COLUMN new_product_id uuid;

UPDATE cart_items
SET new_product_id = product_id;

ALTER TABLE order_items
ADD COLUMN new_product_id uuid;

UPDATE order_items
SET new_product_id = product_id;

ALTER TABLE wishlists
ADD COLUMN new_product_id uuid;

UPDATE wishlists
SET new_product_id = product_id;

ALTER TABLE product_views
ADD COLUMN new_product_id uuid;

UPDATE product_views
SET new_product_id = product_id;

-- Drop old foreign key constraints
ALTER TABLE cart_items DROP CONSTRAINT cart_items_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT order_items_product_id_fkey;
ALTER TABLE wishlists DROP CONSTRAINT wishlists_product_id_fkey;
ALTER TABLE product_views DROP CONSTRAINT product_views_product_id_fkey;

-- Drop old product_id columns
ALTER TABLE cart_items DROP COLUMN product_id;
ALTER TABLE order_items DROP COLUMN product_id;
ALTER TABLE wishlists DROP COLUMN product_id;
ALTER TABLE product_views DROP COLUMN product_id;

-- Rename new columns
ALTER TABLE cart_items RENAME COLUMN new_product_id TO product_id;
ALTER TABLE order_items RENAME COLUMN new_product_id TO product_id;
ALTER TABLE wishlists RENAME COLUMN new_product_id TO product_id;
ALTER TABLE product_views RENAME COLUMN new_product_id TO product_id;

-- Drop old table and rename new table
DROP TABLE products;
ALTER TABLE products_new RENAME TO products;

-- Add new foreign key constraints
ALTER TABLE cart_items
ADD CONSTRAINT cart_items_product_id_fkey
FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE wishlists
ADD CONSTRAINT wishlists_product_id_fkey
FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE product_views
ADD CONSTRAINT product_views_product_id_fkey
FOREIGN KEY (product_id) REFERENCES products(id);

-- Recreate soft delete function
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

-- Recreate soft delete trigger
CREATE TRIGGER trigger_soft_delete_product
  BEFORE DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_product();

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Recreate policies
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

-- Add validation function for hex colors
CREATE OR REPLACE FUNCTION is_valid_hex_color(color text)
RETURNS boolean AS $$
BEGIN
  RETURN color ~ '^#[0-9A-Fa-f]{6}$';
END;
$$ LANGUAGE plpgsql;

-- Add validation function for color array
CREATE OR REPLACE FUNCTION validate_color_array(colors text[])
RETURNS boolean AS $$
DECLARE
  color text;
BEGIN
  IF colors IS NULL OR array_length(colors, 1) < 1 THEN
    RETURN false;
  END IF;
  
  FOREACH color IN ARRAY colors
  LOOP
    IF NOT is_valid_hex_color(color) THEN
      RETURN false;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for color validation
ALTER TABLE products 
ADD CONSTRAINT valid_color_format 
CHECK (validate_color_array(color));