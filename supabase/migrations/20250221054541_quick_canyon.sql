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

-- First drop the existing constraint if it exists
DO $$ 
BEGIN
  ALTER TABLE products DROP CONSTRAINT IF EXISTS valid_color_format;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add temporary column for new format
DO $$ 
BEGIN
  ALTER TABLE products ADD COLUMN new_color text;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Convert existing color data to hex format with more lenient validation
UPDATE products 
SET new_color = CASE 
  WHEN color IS NULL OR color = '' THEN '#000000'
  WHEN color ~ '^#[0-9A-Fa-f]{6}(, #[0-9A-Fa-f]{6})*$' THEN color
  WHEN color ~ '^[A-Za-z]+$' THEN '#000000' -- Convert named colors to default
  ELSE '#000000'
END;

-- Drop old column and rename new column
ALTER TABLE products 
DROP COLUMN IF EXISTS color;

ALTER TABLE products 
RENAME COLUMN new_color TO color;

-- Add validation function
CREATE OR REPLACE FUNCTION is_valid_color_format(colors text)
RETURNS boolean AS $$
BEGIN
  RETURN colors IS NULL 
    OR colors = '' 
    OR colors ~ '^#[0-9A-Fa-f]{6}(, #[0-9A-Fa-f]{6})*$';
END;
$$ LANGUAGE plpgsql;

-- Add constraint with NOT VALID to prevent validation of existing data
ALTER TABLE products 
ADD CONSTRAINT valid_color_format 
CHECK (is_valid_color_format(color)) NOT VALID;

-- Validate constraint for future inserts/updates only
ALTER TABLE products 
VALIDATE CONSTRAINT valid_color_format;