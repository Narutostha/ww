/*
  # Fix Admin RLS and Policies

  1. Changes
    - Drop and recreate admin-related functions
    - Update RLS policies for products and admins
    - Add policy for initial admin creation
    - Ensure super admin exists

  2. Security
    - Enable RLS on tables
    - Add policies for admin management
    - Add policy for initial setup
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop product policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'products_public_read'
  ) THEN
    DROP POLICY IF EXISTS "products_public_read" ON products;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'products_admin_all'
  ) THEN
    DROP POLICY IF EXISTS "products_admin_all" ON products;
  END IF;

  -- Drop admin policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admins' 
    AND policyname = 'admins_read_all'
  ) THEN
    DROP POLICY IF EXISTS "admins_read_all" ON admins;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admins' 
    AND policyname = 'admins_super_manage'
  ) THEN
    DROP POLICY IF EXISTS "admins_super_manage" ON admins;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admins' 
    AND policyname = 'allow_initial_admin_creation'
  ) THEN
    DROP POLICY IF EXISTS "allow_initial_admin_creation" ON admins;
  END IF;
END $$;

-- Recreate helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id::text = auth.uid()::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id::text = auth.uid()::text 
    AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies
DO $$ 
BEGIN
  -- Create product policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'products_public_read'
  ) THEN
    CREATE POLICY "products_public_read"
      ON products
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'products' 
    AND policyname = 'products_admin_all'
  ) THEN
    CREATE POLICY "products_admin_all"
      ON products
      FOR ALL
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;

  -- Create admin policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admins' 
    AND policyname = 'admins_read_all'
  ) THEN
    CREATE POLICY "admins_read_all"
      ON admins
      FOR SELECT
      TO authenticated
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admins' 
    AND policyname = 'admins_super_manage'
  ) THEN
    CREATE POLICY "admins_super_manage"
      ON admins
      FOR ALL
      TO authenticated
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'admins' 
    AND policyname = 'allow_initial_admin_creation'
  ) THEN
    CREATE POLICY "allow_initial_admin_creation"
      ON admins
      FOR INSERT
      TO authenticated
      WITH CHECK (
        NOT EXISTS (SELECT 1 FROM admins)
      );
  END IF;
END $$;

-- Ensure initial admin exists
DO $$
DECLARE
  auth_user_id uuid;
BEGIN
  -- Only proceed if no admin exists
  IF NOT EXISTS (SELECT 1 FROM admins) THEN
    -- Check if auth user exists
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'admin@example.com'
    LIMIT 1;

    -- Create auth user if doesn't exist
    IF auth_user_id IS NULL THEN
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@example.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        '{"name": "Admin User"}'::jsonb,
        now(),
        now()
      )
      RETURNING id INTO auth_user_id;
    END IF;

    -- Create admin record
    INSERT INTO admins (id, email, password, name, role)
    VALUES (
      auth_user_id,
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      'Admin User',
      'SUPER_ADMIN'
    );
  END IF;
END $$;