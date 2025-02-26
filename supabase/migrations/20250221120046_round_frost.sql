-- Drop existing policies
DROP POLICY IF EXISTS "Enable access for admins" ON orders;
DROP POLICY IF EXISTS "Users can view their orders" ON orders;
DROP POLICY IF EXISTS "Users can manage their own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON customer_profiles;

-- Create policies for orders table
CREATE POLICY "Users can manage their own orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id::text = auth.uid()::text
    )
  );

-- Create policies for order_items table
CREATE POLICY "Users can manage their order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Create policies for customer_profiles table
CREATE POLICY "Users can manage their own profile"
  ON customer_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all profiles"
  ON customer_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id::text = auth.uid()::text
    )
  );

-- Create or update customer_profiles table
DO $$ 
BEGIN
  -- Add total_orders and total_spent columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_profiles' 
    AND column_name = 'total_orders'
  ) THEN
    ALTER TABLE customer_profiles 
    ADD COLUMN total_orders integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_profiles' 
    AND column_name = 'total_spent'
  ) THEN
    ALTER TABLE customer_profiles 
    ADD COLUMN total_spent decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_profiles' 
    AND column_name = 'last_order_date'
  ) THEN
    ALTER TABLE customer_profiles 
    ADD COLUMN last_order_date timestamptz;
  END IF;
END $$;

-- Create function to update customer profile stats
CREATE OR REPLACE FUNCTION update_customer_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update customer profile stats
  UPDATE customer_profiles
  SET
    total_orders = COALESCE((
      SELECT COUNT(*) 
      FROM orders 
      WHERE user_id = NEW.user_id
    ), 0),
    total_spent = COALESCE((
      SELECT SUM(total) 
      FROM orders 
      WHERE user_id = NEW.user_id
    ), 0),
    last_order_date = NEW.created_at
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating customer profile stats
DROP TRIGGER IF EXISTS update_customer_stats_after_order ON orders;
CREATE TRIGGER update_customer_stats_after_order
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_profile_stats();