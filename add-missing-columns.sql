-- Migration: Add missing columns to order_items table
-- Run this in your Supabase SQL Editor

-- Add has_gift_box column
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS has_gift_box BOOLEAN DEFAULT FALSE;

-- Add has_extra_items column
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS has_extra_items BOOLEAN DEFAULT FALSE;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

