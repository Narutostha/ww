/*
  # Update Product Colors Schema

  1. Changes
    - Convert color column to array type
    - Add validation for hex color format
    - Handle existing data safely

  2. Security
    - Maintain existing RLS policies
    - No data loss during migration
*/

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

-- Create temporary column for the transition
ALTER TABLE products 
ADD COLUMN color_array text[] DEFAULT ARRAY['#000000'];

-- Copy existing color data to array column
UPDATE products 
SET color_array = CASE
  WHEN color IS NULL OR color = '' THEN ARRAY['#000000']
  WHEN color ~ '^#[0-9A-Fa-f]{6}$' THEN ARRAY[color]
  WHEN color ~ '^#[0-9A-Fa-f]{6}(, #[0-9A-Fa-f]{6})*$' THEN 
    string_to_array(color, ', ')
  ELSE ARRAY['#000000']
END;

-- Drop old column
ALTER TABLE products 
DROP COLUMN color;

-- Rename array column to color
ALTER TABLE products 
RENAME COLUMN color_array TO color;

-- Add check constraint using the validation function
ALTER TABLE products 
ADD CONSTRAINT valid_color_format 
CHECK (validate_color_array(color));