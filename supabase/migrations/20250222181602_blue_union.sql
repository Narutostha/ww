-- Create shipping_info table
CREATE TABLE IF NOT EXISTS shipping_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  delivery_time text NOT NULL,
  cost decimal(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create return_policy table
CREATE TABLE IF NOT EXISTS return_policy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  duration_days integer NOT NULL DEFAULT 30,
  conditions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shipping_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_policy ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can view shipping info"
  ON shipping_info
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage shipping info"
  ON shipping_info
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Public can view return policy"
  ON return_policy
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage return policy"
  ON return_policy
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id::text = auth.uid()::text
    )
  );

-- Insert default shipping info
INSERT INTO shipping_info (region, delivery_time, cost, free_shipping_threshold)
VALUES 
  ('Kathmandu Valley', '2-3 days', 200, 10000),
  ('Outside Valley', '3-7 days', 300, 10000);

-- Insert default return policy
INSERT INTO return_policy (title, description, duration_days, conditions)
VALUES (
  'Standard Return Policy',
  'We want you to be completely satisfied with your purchase. If you are not satisfied, you can return the item within the specified time frame.',
  30,
  ARRAY[
    'Item must be unused and in original packaging',
    'Original tags must be attached',
    'Proof of purchase required',
    'Return shipping cost is borne by the customer'
  ]
);