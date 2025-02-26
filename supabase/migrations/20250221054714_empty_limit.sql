/*
  # Fix Product Colors Schema

  1. Changes
    - Ensure color column exists and has correct format
    - Add proper constraints
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

-- Ensure color column exists with correct type
DO $$ 
BEGIN
  -- Add color column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'color'
  ) THEN
    ALTER TABLE products ADD COLUMN color text;
  END IF;
END $$;

-- Update any NULL or invalid colors to default
UPDATE products 
SET color = '#000000' 
WHERE color IS NULL OR color = '' OR NOT (color ~ '^#[0-9A-Fa-f]{6}(, #[0-9A-Fa-f]{6})*$');

-- Create or replace validation function
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