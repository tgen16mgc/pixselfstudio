-- Pixself Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_social TEXT,
  shipping_option TEXT NOT NULL CHECK (shipping_option IN ('pickup', 'delivery')),
  shipping_address JSONB, -- Store address as JSON if delivery
  discount_code TEXT,
  total_price INTEGER NOT NULL, -- Price in VND (Vietnamese Dong)
  payment_proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  png_data_url TEXT NOT NULL, -- Base64 encoded PNG data
  nametag TEXT NOT NULL,
  has_charm BOOLEAN DEFAULT FALSE,
  has_gift_box BOOLEAN DEFAULT FALSE,
  has_extra_items BOOLEAN DEFAULT FALSE,
  item_price INTEGER NOT NULL, -- Price in VND
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Create updated_at trigger for orders table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Optional but recommended
-- Enable RLS on tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data (for your API)
CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage order items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- If you want to add customer access later (optional)
-- CREATE POLICY "Customers can view their own orders" ON orders
--   FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('order-files', 'order-files', true);

-- Storage policies for order files
CREATE POLICY "Service role can upload order files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'order-files' AND auth.role() = 'service_role');

CREATE POLICY "Service role can view order files" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-files' AND auth.role() = 'service_role');

CREATE POLICY "Public can view order files" ON storage.objects
  FOR SELECT USING (bucket_id = 'order-files');

-- Optional: Create a view for order summaries
CREATE VIEW order_summaries AS
SELECT 
  o.id,
  o.customer_name,
  o.customer_email,
  o.customer_phone,
  o.shipping_option,
  o.total_price,
  o.status,
  o.created_at,
  COUNT(oi.id) as item_count,
  ARRAY_AGG(oi.nametag) as nametags
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.customer_name, o.customer_email, o.customer_phone, 
         o.shipping_option, o.total_price, o.status, o.created_at;

-- Discount codes table
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL, -- percentage (1-100) or VND amount
  apply_to TEXT DEFAULT 'total' CHECK (apply_to IN ('total', 'first_item')),
  min_purchase INTEGER DEFAULT 0, -- minimum purchase amount in VND
  max_discount INTEGER, -- max discount cap in VND (for percentage)
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER, -- null = unlimited
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for discount codes
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active);

-- Create updated_at trigger for discount_codes table
CREATE TRIGGER update_discount_codes_updated_at 
    BEFORE UPDATE ON discount_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS for discount codes
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage discount codes" ON discount_codes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Insert some sample data for testing (optional)
-- INSERT INTO orders (id, customer_name, customer_email, customer_phone, shipping_option, total_price) 
-- VALUES ('PIXSELF-TEST-001', 'Test Customer', 'test@example.com', '+84123456789', 'pickup', 49000);

-- INSERT INTO order_items (id, order_id, png_data_url, nametag, has_charm, item_price)
-- VALUES ('PIXSELF-TEST-001-ITEM-001', 'PIXSELF-TEST-001', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'TestName', false, 49000);
