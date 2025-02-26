/*
  # Add Customer Analytics Tables

  1. New Tables
    - `customer_profiles`
      - Stores aggregated customer data and preferences
      - Links to auth.users for authentication
    - `customer_activities`
      - Tracks customer interactions and events
    - `wishlists`
      - Stores customer wishlist items
    - `product_views`
      - Tracks product view history
    - `abandoned_carts`
      - Tracks abandoned shopping carts

  2. Changes to Existing Tables
    - Added indexes for better query performance
    - Added new columns for analytics tracking

  3. Security
    - Enable RLS on all new tables
    - Add policies for customer data access
*/

-- Create customer_profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  total_orders integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  average_order_value decimal(10,2) DEFAULT 0,
  last_order_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customer_activities table
CREATE TABLE IF NOT EXISTS customer_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- Create product_views table
CREATE TABLE IF NOT EXISTS product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  view_count integer DEFAULT 1,
  last_viewed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create abandoned_carts table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  cart_data jsonb NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  recovered_at timestamptz
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_activities_customer_id ON customer_activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_views_customer_id ON product_views(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_customer_id ON abandoned_carts(customer_id);

-- Enable Row Level Security
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Customer Profiles policies
CREATE POLICY "Users can view their own profile"
  ON customer_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON customer_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

-- Customer Activities policies
CREATE POLICY "Users can view their own activities"
  ON customer_activities
  FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all activities"
  ON customer_activities
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

-- Wishlists policies
CREATE POLICY "Users can manage their wishlists"
  ON wishlists
  FOR ALL
  TO authenticated
  USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

-- Product Views policies
CREATE POLICY "Users can view their product view history"
  ON product_views
  FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all product views"
  ON product_views
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

-- Abandoned Carts policies
CREATE POLICY "Users can view their abandoned carts"
  ON abandoned_carts
  FOR SELECT
  TO authenticated
  USING (customer_id IN (
    SELECT id FROM customer_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all abandoned carts"
  ON abandoned_carts
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admins));

-- Create functions for analytics

-- Function to update customer profile stats
CREATE OR REPLACE FUNCTION update_customer_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_profiles
  SET
    total_orders = (
      SELECT COUNT(*) FROM orders WHERE user_id = NEW.user_id
    ),
    total_spent = (
      SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = NEW.user_id
    ),
    average_order_value = (
      SELECT COALESCE(AVG(total), 0) FROM orders WHERE user_id = NEW.user_id
    ),
    last_order_date = NEW.created_at,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer profile stats after order
CREATE TRIGGER update_customer_stats_after_order
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_profile_stats();