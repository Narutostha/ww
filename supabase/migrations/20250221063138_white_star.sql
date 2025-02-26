-- First ensure we have a clean slate
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_color_format;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create function to validate hex color format
CREATE OR REPLACE FUNCTION is_valid_hex_color(color text)
RETURNS boolean AS $$
BEGIN
  RETURN color ~ '^#[0-9A-Fa-f]{6}$';
END;
$$ LANGUAGE plpgsql;

-- Create function to validate color array
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

-- Update demo products with proper color arrays
UPDATE products
SET color = ARRAY['#000000', '#333333']::text[]
WHERE name = 'Urban Tech Puffer Jacket';

UPDATE products
SET color = ARRAY['#556B2F', '#8B4513']::text[]
WHERE name = 'Streetwear Cargo Pants';

UPDATE products
SET color = ARRAY['#808080', '#696969']::text[]
WHERE name = 'Essential Oversized Hoodie';

UPDATE products
SET color = ARRAY['#FFFFFF', '#F5F5F5']::text[]
WHERE name = 'Urban Core T-Shirt';

UPDATE products
SET color = ARRAY['#000080', '#191970']::text[]
WHERE name = 'Tech Fleece Joggers';

-- Add check constraint using the validation function
ALTER TABLE products 
ADD CONSTRAINT valid_color_format 
CHECK (validate_color_array(color));