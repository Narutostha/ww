-- Add selected_color column to order_items table
ALTER TABLE order_items
ADD COLUMN selected_color text;

-- Update the RLS policies to include the new column
DROP POLICY IF EXISTS "Users can manage their order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;

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

CREATE POLICY "Admins can manage all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id::text = auth.uid()::text
    )
  );