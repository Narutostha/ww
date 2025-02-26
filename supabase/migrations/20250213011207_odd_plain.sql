-- First, clean up existing policies
DROP POLICY IF EXISTS "Enable write access for admins" ON products;
DROP POLICY IF EXISTS "Enable read access for admins" ON orders;
DROP POLICY IF EXISTS "Enable write access for admins" ON orders;
DROP POLICY IF EXISTS "Enable access for admins" ON orders;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Public can view products" ON products;

-- Create function to safely create or update admin user
CREATE OR REPLACE FUNCTION safely_create_or_update_admin(
  admin_email text,
  admin_password text,
  admin_name text,
  admin_role admin_role
) RETURNS void AS $$
DECLARE
  existing_auth_user_id uuid;
  existing_admin_id uuid;
BEGIN
  -- Check for existing auth user
  SELECT id INTO existing_auth_user_id
  FROM auth.users
  WHERE email = admin_email;

  -- Check for existing admin
  SELECT id INTO existing_admin_id
  FROM admins
  WHERE email = admin_email;

  -- If admin exists, just update their details
  IF existing_admin_id IS NOT NULL THEN
    UPDATE admins
    SET
      password = crypt(admin_password, gen_salt('bf')),
      name = admin_name,
      role = admin_role,
      updated_at = now()
    WHERE id = existing_admin_id;
    RETURN;
  END IF;

  -- If auth user exists but no admin record, create admin record
  IF existing_auth_user_id IS NOT NULL THEN
    INSERT INTO admins (id, email, password, name, role)
    VALUES (
      existing_auth_user_id,
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      admin_name,
      admin_role
    );
    RETURN;
  END IF;

  -- If neither exists, create both (this shouldn't happen in this case)
  -- but included for completeness
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
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
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('name', admin_name),
    now(),
    now()
  )
  RETURNING id INTO existing_auth_user_id;

  INSERT INTO admins (id, email, password, name, role)
  VALUES (
    existing_auth_user_id,
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    admin_name,
    admin_role
  );
END;
$$ LANGUAGE plpgsql;

-- Safely create or update admin user
SELECT safely_create_or_update_admin(
  'admin@example.com',
  'admin123',
  'Admin User',
  'SUPER_ADMIN'
);

-- Update RLS policies for products
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

-- Update RLS policies for orders
CREATE POLICY "Enable access for admins"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));