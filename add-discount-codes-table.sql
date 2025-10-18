-- Migration: Add discount_codes table
-- Run this in your Supabase SQL Editor

-- Create discount_codes table
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

-- Create indexes for better performance
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active);

-- Create updated_at trigger for discount_codes table
CREATE OR REPLACE FUNCTION update_discount_codes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discount_codes_updated_at 
    BEFORE UPDATE ON discount_codes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_discount_codes_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data (for your API)
CREATE POLICY "Service role can manage discount codes" ON discount_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Allow public read access for validation (only active codes)
CREATE POLICY "Public can read active discount codes" ON discount_codes
  FOR SELECT USING (is_active = true);

-- Insert sample discount codes
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to, is_active) VALUES
('PIX10', 'percentage', 10, 'total', true),
('MOA20', 'percentage', 20, 'total', true),
('FIRST5K', 'fixed', 5000, 'first_item', true),
('WELCOME', 'percentage', 15, 'total', true),
('SAVE50', 'fixed', 50000, 'total', true);

-- Verify the table was created
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'discount_codes'
ORDER BY ordinal_position;
