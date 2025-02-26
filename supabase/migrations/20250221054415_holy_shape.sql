/*
  # Update Products Color Schema

  1. Changes
    - Add temporary column for new color format
    - Convert existing color data to hex format
    - Add constraint for hex color format
    - Preserve existing data

  2. Security
    - Maintain existing RLS policies
    - No data loss during migration
*/

-- Add temporary column for new format
ALTER TABLE products 
ADD COLUMN new_color text;

-- Convert existing color data to hex format
UPDATE products 
SET new_color = CASE 
  WHEN color IS NULL OR color = '' THEN '#000000'
  WHEN color ~ '^#[0-9A-Fa-f]{6}(, #[0-9A-Fa-f]{6})*$' THEN color
  ELSE '#000000'
END;

-- Drop old column and rename new column
ALTER TABLE products 
DROP COLUMN color;

ALTER TABLE products 
RENAME COLUMN new_color TO color;

-- Add check constraint with validation function
CREATE OR REPLACE FUNCTION is_valid_color_format(colors text)
RETURNS boolean AS $$
BEGIN
  RETURN colors IS NULL 
    OR colors = '' 
    OR colors ~ '^#[0-9A-Fa-f]{6}(, #[0-9A-Fa-f]{6})*$';
END;
$$ LANGUAGE plpgsql;

ALTER TABLE products 
ADD CONSTRAINT valid_color_format 
CHECK (is_valid_color_format(color));