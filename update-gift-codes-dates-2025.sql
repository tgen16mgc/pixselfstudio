-- Migration: Update gift codes dates from 2024 to 2025
-- Run this in your Supabase SQL Editor to fix dates for existing gift codes

-- Update all gift codes to use 2025 dates instead of 2024
UPDATE discount_codes 
SET 
  valid_from = '2025-10-31 00:00:00',
  valid_until = '2025-11-30 23:59:59'
WHERE 
  discount_type = 'gift'
  AND valid_from = '2024-10-31 00:00:00'
  AND valid_until = '2024-11-30 23:59:59';

-- Verify the update
SELECT code, discount_type, valid_from, valid_until, usage_limit, is_active 
FROM discount_codes 
WHERE discount_type = 'gift' 
ORDER BY code
LIMIT 10;
