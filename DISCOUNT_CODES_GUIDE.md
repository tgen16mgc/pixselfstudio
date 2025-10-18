# Discount Codes Management Guide

## Overview
This guide explains how to manage discount codes in the Pixself Studio system. The discount code system is database-backed and supports both percentage and fixed-amount discounts with special conditions.

## Database Setup

### 1. Run the Migration
Execute the SQL migration in your Supabase SQL Editor:

```sql
-- Run the contents of add-discount-codes-table.sql
```

This creates the `discount_codes` table with all necessary fields and sample data.

### 2. Verify Setup
Check that the table was created successfully:

```sql
SELECT * FROM discount_codes LIMIT 5;
```

## Adding New Discount Codes

### Via Supabase Dashboard

1. **Go to Supabase Dashboard** → Your Project → Table Editor
2. **Select `discount_codes` table**
3. **Click "Insert" → "Insert row"**
4. **Fill in the fields:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `code` | TEXT | Unique discount code (uppercase) | `WELCOME20` |
| `discount_type` | TEXT | `percentage` or `fixed` | `percentage` |
| `discount_value` | INTEGER | % (1-100) or VND amount | `20` |
| `apply_to` | TEXT | `total` or `first_item` | `total` |
| `min_purchase` | INTEGER | Minimum cart value (VND) | `100000` |
| `max_discount` | INTEGER | Max discount cap (VND) | `50000` |
| `is_active` | BOOLEAN | Whether code is active | `true` |
| `valid_from` | TIMESTAMP | Start date (optional) | `2024-01-01` |
| `valid_until` | TIMESTAMP | End date (optional) | `2024-12-31` |
| `usage_limit` | INTEGER | Max uses (null = unlimited) | `100` |

### Via SQL

```sql
INSERT INTO discount_codes (
  code, 
  discount_type, 
  discount_value, 
  apply_to, 
  min_purchase, 
  is_active
) VALUES (
  'SUMMER25', 
  'percentage', 
  25, 
  'total', 
  50000, 
  true
);
```

## Discount Code Types

### 1. Percentage Discounts
- **Type**: `percentage`
- **Value**: 1-100 (percentage)
- **Example**: 20% off total order

```sql
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to) 
VALUES ('SAVE20', 'percentage', 20, 'total');
```

### 2. Fixed Amount Discounts
- **Type**: `fixed`
- **Value**: VND amount
- **Example**: 50,000 VND off

```sql
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to) 
VALUES ('SAVE50K', 'fixed', 50000, 'total');
```

### 3. First Item Only Discounts
- **Apply To**: `first_item`
- **Example**: 5,000 VND off first keychain only

```sql
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to) 
VALUES ('FIRST5K', 'fixed', 5000, 'first_item');
```

## Advanced Configuration

### Minimum Purchase Requirements
```sql
-- 15% off orders over 100,000 VND
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to, min_purchase) 
VALUES ('VIP15', 'percentage', 15, 'total', 100000);
```

### Maximum Discount Caps
```sql
-- 50% off, but max 25,000 VND discount
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to, max_discount) 
VALUES ('HALF50', 'percentage', 50, 'total', 25000);
```

### Time-Limited Codes
```sql
-- Valid only during Black Friday
INSERT INTO discount_codes (
  code, discount_type, discount_value, apply_to, 
  valid_from, valid_until, is_active
) VALUES (
  'BLACKFRIDAY', 'percentage', 30, 'total',
  '2024-11-24 00:00:00', '2024-11-25 23:59:59', true
);
```

### Usage Limits
```sql
-- First 100 customers only
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to, usage_limit) 
VALUES ('EARLY100', 'percentage', 20, 'total', 100);
```

## Managing Existing Codes

### Deactivate a Code
```sql
UPDATE discount_codes 
SET is_active = false 
WHERE code = 'EXPIRED_CODE';
```

### Extend Validity
```sql
UPDATE discount_codes 
SET valid_until = '2024-12-31 23:59:59' 
WHERE code = 'EXTENDED_CODE';
```

### Check Usage Statistics
```sql
SELECT 
  code,
  usage_count,
  usage_limit,
  CASE 
    WHEN usage_limit IS NULL THEN 'Unlimited'
    ELSE CONCAT(usage_count, '/', usage_limit)
  END as usage_status
FROM discount_codes 
WHERE is_active = true;
```

## Testing Discount Codes

### 1. Test via API
```bash
curl -X POST http://localhost:3000/api/discount/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PIX10",
    "items": [{"id": "1", "nametag": "TEST", "hasCharm": false, "hasGiftBox": false, "hasExtraItems": false, "price": 49000}],
    "subtotal": 49000
  }'
```

### 2. Test via Checkout Page
1. Add items to cart
2. Go to checkout page
3. Enter discount code
4. Click "Apply"
5. Verify discount appears in pricing summary

## Common Use Cases

### 1. Welcome Discount
```sql
-- 15% off for new customers
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to, usage_limit) 
VALUES ('WELCOME15', 'percentage', 15, 'total', 1);
```

### 2. Bulk Purchase Discount
```sql
-- 10% off orders over 200,000 VND
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to, min_purchase) 
VALUES ('BULK10', 'percentage', 10, 'total', 200000);
```

### 3. First Item Promotion
```sql
-- 5,000 VND off first keychain
INSERT INTO discount_codes (code, discount_type, discount_value, apply_to) 
VALUES ('FIRST5K', 'fixed', 5000, 'first_item');
```

### 4. Seasonal Campaign
```sql
-- 30% off during Christmas
INSERT INTO discount_codes (
  code, discount_type, discount_value, apply_to,
  valid_from, valid_until, is_active
) VALUES (
  'CHRISTMAS30', 'percentage', 30, 'total',
  '2024-12-20 00:00:00', '2024-12-25 23:59:59', true
);
```

## Troubleshooting

### Code Not Working
1. **Check if code exists:**
   ```sql
   SELECT * FROM discount_codes WHERE code = 'YOUR_CODE';
   ```

2. **Verify it's active:**
   ```sql
   SELECT is_active FROM discount_codes WHERE code = 'YOUR_CODE';
   ```

3. **Check date validity:**
   ```sql
   SELECT valid_from, valid_until FROM discount_codes WHERE code = 'YOUR_CODE';
   ```

4. **Check usage limits:**
   ```sql
   SELECT usage_count, usage_limit FROM discount_codes WHERE code = 'YOUR_CODE';
   ```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid discount code" | Code doesn't exist or inactive | Check code spelling and status |
| "Minimum purchase required" | Cart below minimum | Increase cart value |
| "Discount code has expired" | Past valid_until date | Update valid_until or create new code |
| "Usage limit reached" | usage_count >= usage_limit | Increase usage_limit or create new code |
| "No discount applicable" | Discount amount = 0 | Check min_purchase and cart value |

## Monitoring and Analytics

### Track Code Performance
```sql
-- Most used discount codes
SELECT 
  code,
  usage_count,
  discount_type,
  discount_value,
  apply_to
FROM discount_codes 
WHERE is_active = true 
ORDER BY usage_count DESC;
```

### Revenue Impact
```sql
-- Calculate total discount given
SELECT 
  code,
  usage_count,
  discount_value,
  CASE 
    WHEN discount_type = 'percentage' THEN 'Variable'
    ELSE usage_count * discount_value
  END as total_discount_vnd
FROM discount_codes 
WHERE is_active = true;
```

## Security Best Practices

1. **Use Strong Codes**: Avoid predictable patterns like `TEST123`
2. **Set Expiration Dates**: Don't leave codes active indefinitely
3. **Monitor Usage**: Check for unusual usage patterns
4. **Limit Access**: Only authorized personnel should manage codes
5. **Regular Cleanup**: Deactivate old/unused codes

## Support

For technical issues:
- Check Supabase logs for database errors
- Verify API endpoint is working: `/api/discount/validate`
- Test with sample codes: `PIX10`, `MOA20`, `FIRST5K`

For business questions:
- Contact: 0345205918 (Mr. Tiên) | 0961726061 (Ms. Giang)

---

## Quick Reference

### Sample Codes (Pre-loaded)
- `PIX10` - 10% off total
- `MOA20` - 20% off total  
- `FIRST5K` - 5,000 VND off first item
- `WELCOME` - 15% off total
- `SAVE50` - 50,000 VND off total

### API Endpoints
- `POST /api/discount/validate` - Validate discount code
- `GET /api/discount/validate?code=CODE` - Check if code exists

### Database Table
- Table: `discount_codes`
- Key fields: `code`, `discount_type`, `discount_value`, `apply_to`
- Status: `is_active`, `valid_from`, `valid_until`
- Limits: `usage_limit`, `usage_count`
