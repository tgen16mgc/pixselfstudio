# PIXSELF Coupon Codes - Special Campaign

## Overview
This guide covers the 100 special PIXSELF coupon codes with conditional discount logic based on gift box selection.

## Campaign Details

### **Code Configuration:**
- **Total Codes**: 100 unique codes
- **Validity Period**: October 17, 2025 - November 17, 2025
- **Usage Limit**: 1 use per code (single-use only)
- **Apply To**: First item in cart only
- **Conditional Discount**: Based on gift box selection

### **Discount Logic:**
```
IF first_item.has_gift_box = true:
    discount = 10% off first item
ELSE:
    discount = 15% off first item
```

## Code List

The following 100 codes have been added to the database:

```
4785, YL9V, SVA4, CG45, 8KLE, BP2W, 2DR1, YUMM, HTJ7, OGI6,
LT38, 8U5K, LK4W, AFB9, E5ND, L73D, 4BHR, QMDO, 80Q6, QJWE,
Q3H7, 3Z2O, TSXC, U0X2, BDK6, 4Y5D, CFGL, 0SXE, B7JY, KOGR,
7YTR, TR2J, D3DC, OYUG, 2YGQ, ZYYF, IC6P, GZHB, E7Z8, SPAC,
1CLJ, M39C, 027J, VGEQ, JGW7, 51VZ, LB5A, FVYN, KCN6, H7LK,
VJO4, ML98, GXBT, KSAX, VQTU, 44WI, 6K6J, 4P43, ORA2, XUS3,
CX33, WVGM, S3RX, SJI3, 6Q3F, KT43, DLOH, XMR0, NWIT, L1LL,
QPGB, JKVC, GO5F, CWWX, JXUG, EKXN, 5WS1, 2XH1, OZD6, RQN9,
0UOS, XWD0, 8GF5, TTET, DFOS, 2O4Z, GGAO, 9A76, COCZ, JMHL,
9C5V, BD86, OMP5, WN7T, D5W6, GEFB, FPZR, DSSP, 18UB, ZMSO
```

## Database Setup

### 1. Run the Migration
Execute the SQL script in Supabase SQL Editor:

```sql
-- Run the contents of add-pixself-coupon-codes.sql
```

### 2. Verify Setup
Check that all codes were inserted:

```sql
SELECT COUNT(*) as total_pixself_codes 
FROM discount_codes 
WHERE code IN (
  '4785', 'YL9V', 'SVA4', 'CG45', '8KLE', 'BP2W', '2DR1', 'YUMM', 'HTJ7', 'OGI6',
  'LT38', '8U5K', 'LK4W', 'AFB9', 'E5ND', 'L73D', '4BHR', 'QMDO', '80Q6', 'QJWE',
  'Q3H7', '3Z2O', 'TSXC', 'U0X2', 'BDK6', '4Y5D', 'CFGL', '0SXE', 'B7JY', 'KOGR',
  '7YTR', 'TR2J', 'D3DC', 'OYUG', '2YGQ', 'ZYYF', 'IC6P', 'GZHB', 'E7Z8', 'SPAC',
  '1CLJ', 'M39C', '027J', 'VGEQ', 'JGW7', '51VZ', 'LB5A', 'FVYN', 'KCN6', 'H7LK',
  'VJO4', 'ML98', 'GXBT', 'KSAX', 'VQTU', '44WI', '6K6J', '4P43', 'ORA2', 'XUS3',
  'CX33', 'WVGM', 'S3RX', 'SJI3', '6Q3F', 'KT43', 'DLOH', 'XMR0', 'NWIT', 'L1LL',
  'QPGB', 'JKVC', 'GO5F', 'CWWX', 'JXUG', 'EKXN', '5WS1', '2XH1', 'OZD6', 'RQN9',
  '0UOS', 'XWD0', '8GF5', 'TTET', 'DFOS', '2O4Z', 'GGAO', '9A76', 'COCZ', 'JMHL',
  '9C5V', 'BD86', 'OMP5', 'WN7T', 'D5W6', 'GEFB', 'FPZR', 'DSSP', '18UB', 'ZMSO'
);
```

Should return: `total_pixself_codes: 100`

## How It Works

### **Customer Experience:**

1. **Customer adds items to cart**
   - First item: Keychain with/without gift box
   - Additional items: Regular keychains

2. **Customer enters PIXSELF code**
   - Code: `4785`, `YL9V`, `SVA4`, etc.
   - Clicks "Apply" button

3. **System validates code**
   - Checks if code exists and is active
   - Verifies date validity (Oct 17 - Nov 17, 2025)
   - Checks usage limit (must be unused)

4. **Conditional discount applied**
   - **If first item has gift box**: 10% off first item
   - **If first item has no gift box**: 15% off first item
   - **Only applies to first item**, not entire cart

5. **Code becomes invalid**
   - After successful checkout, code is marked as used
   - Cannot be used again by anyone

### **Example Scenarios:**

#### Scenario 1: First item WITH gift box
```
Cart: 
- Keychain "DEMO" + Gift Box (89,000 VND)
- Keychain "TEST" (49,000 VND)
Total: 138,000 VND

Code: 4785
Discount: 10% off first item = 8,900 VND
Final: 129,100 VND
```

#### Scenario 2: First item WITHOUT gift box
```
Cart:
- Keychain "DEMO" (49,000 VND)  
- Keychain "TEST" + Gift Box (89,000 VND)
Total: 138,000 VND

Code: YL9V
Discount: 15% off first item = 7,350 VND
Final: 130,650 VND
```

## Technical Implementation

### **API Validation Logic:**
```typescript
if (discount.applyTo === 'first_item') {
  const firstItem = items[0]
  
  if (firstItem.hasGiftBox) {
    // 10% off if has gift box
    discountAmount = Math.round(firstItem.price * 0.10)
  } else {
    // 15% off if no gift box  
    discountAmount = Math.round(firstItem.price * 0.15)
  }
}
```

### **Usage Tracking:**
- When order is completed, `usage_count` is incremented
- Code becomes invalid for future use
- Prevents code sharing/abuse

## Monitoring & Analytics

### **Track Code Usage:**
```sql
-- See which codes have been used
SELECT 
  code,
  usage_count,
  CASE 
    WHEN usage_count > 0 THEN 'USED'
    ELSE 'AVAILABLE'
  END as status
FROM discount_codes 
WHERE code IN ('4785', 'YL9V', 'SVA4', 'CG45', '8KLE')
ORDER BY usage_count DESC;
```

### **Campaign Performance:**
```sql
-- Total codes used vs available
SELECT 
  COUNT(*) as total_codes,
  SUM(usage_count) as total_uses,
  COUNT(*) - SUM(usage_count) as remaining_codes
FROM discount_codes 
WHERE code IN (
  '4785', 'YL9V', 'SVA4', 'CG45', '8KLE', 'BP2W', '2DR1', 'YUMM', 'HTJ7', 'OGI6',
  'LT38', '8U5K', 'LK4W', 'AFB9', 'E5ND', 'L73D', '4BHR', 'QMDO', '80Q6', 'QJWE',
  'Q3H7', '3Z2O', 'TSXC', 'U0X2', 'BDK6', '4Y5D', 'CFGL', '0SXE', 'B7JY', 'KOGR',
  '7YTR', 'TR2J', 'D3DC', 'OYUG', '2YGQ', 'ZYYF', 'IC6P', 'GZHB', 'E7Z8', 'SPAC',
  '1CLJ', 'M39C', '027J', 'VGEQ', 'JGW7', '51VZ', 'LB5A', 'FVYN', 'KCN6', 'H7LK',
  'VJO4', 'ML98', 'GXBT', 'KSAX', 'VQTU', '44WI', '6K6J', '4P43', 'ORA2', 'XUS3',
  'CX33', 'WVGM', 'S3RX', 'SJI3', '6Q3F', 'KT43', 'DLOH', 'XMR0', 'NWIT', 'L1LL',
  'QPGB', 'JKVC', 'GO5F', 'CWWX', 'JXUG', 'EKXN', '5WS1', '2XH1', 'OZD6', 'RQN9',
  '0UOS', 'XWD0', '8GF5', 'TTET', 'DFOS', '2O4Z', 'GGAO', '9A76', 'COCZ', 'JMHL',
  '9C5V', 'BD86', 'OMP5', 'WN7T', 'D5W6', 'GEFB', 'FPZR', 'DSSP', '18UB', 'ZMSO'
);
```

## Testing

### **Test the Codes:**
1. Add items to cart (first item with/without gift box)
2. Go to checkout page
3. Enter any PIXSELF code: `4785`, `YL9V`, etc.
4. Click "Apply"
5. Verify discount amount:
   - With gift box: 10% off first item
   - Without gift box: 15% off first item
6. Complete order
7. Try using same code again - should be invalid

### **Test Edge Cases:**
- Empty cart (should show "No items in cart")
- Code after expiration date (should show "Discount code has expired")
- Used code (should show "Usage limit reached")
- Invalid code (should show "Invalid discount code")

## Troubleshooting

### **Common Issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "No items in cart" | Empty cart | Add items to cart first |
| "Invalid discount code" | Wrong code or inactive | Check code spelling |
| "Discount code has expired" | Past Nov 17, 2025 | Code is no longer valid |
| "Usage limit reached" | Code already used | Try different code |
| "No discount applicable" | Discount amount = 0 | Check first item price |

### **Debug Queries:**
```sql
-- Check specific code status
SELECT * FROM discount_codes WHERE code = '4785';

-- Check all PIXSELF codes status
SELECT code, usage_count, is_active, valid_until 
FROM discount_codes 
WHERE code IN ('4785', 'YL9V', 'SVA4')
ORDER BY usage_count DESC;
```

## Campaign Management

### **Extend Campaign:**
```sql
-- Extend validity to Dec 31, 2025
UPDATE discount_codes 
SET valid_until = '2025-12-31 23:59:59' 
WHERE code IN (
  '4785', 'YL9V', 'SVA4', 'CG45', '8KLE', 'BP2W', '2DR1', 'YUMM', 'HTJ7', 'OGI6',
  'LT38', '8U5K', 'LK4W', 'AFB9', 'E5ND', 'L73D', '4BHR', 'QMDO', '80Q6', 'QJWE',
  'Q3H7', '3Z2O', 'TSXC', 'U0X2', 'BDK6', '4Y5D', 'CFGL', '0SXE', 'B7JY', 'KOGR',
  '7YTR', 'TR2J', 'D3DC', 'OYUG', '2YGQ', 'ZYYF', 'IC6P', 'GZHB', 'E7Z8', 'SPAC',
  '1CLJ', 'M39C', '027J', 'VGEQ', 'JGW7', '51VZ', 'LB5A', 'FVYN', 'KCN6', 'H7LK',
  'VJO4', 'ML98', 'GXBT', 'KSAX', 'VQTU', '44WI', '6K6J', '4P43', 'ORA2', 'XUS3',
  'CX33', 'WVGM', 'S3RX', 'SJI3', '6Q3F', 'KT43', 'DLOH', 'XMR0', 'NWIT', 'L1LL',
  'QPGB', 'JKVC', 'GO5F', 'CWWX', 'JXUG', 'EKXN', '5WS1', '2XH1', 'OZD6', 'RQN9',
  '0UOS', 'XWD0', '8GF5', 'TTET', 'DFOS', '2O4Z', 'GGAO', '9A76', 'COCZ', 'JMHL',
  '9C5V', 'BD86', 'OMP5', 'WN7T', 'D5W6', 'GEFB', 'FPZR', 'DSSP', '18UB', 'ZMSO'
);
```

### **End Campaign Early:**
```sql
-- Deactivate all PIXSELF codes
UPDATE discount_codes 
SET is_active = false 
WHERE code IN (
  '4785', 'YL9V', 'SVA4', 'CG45', '8KLE', 'BP2W', '2DR1', 'YUMM', 'HTJ7', 'OGI6',
  'LT38', '8U5K', 'LK4W', 'AFB9', 'E5ND', 'L73D', '4BHR', 'QMDO', '80Q6', 'QJWE',
  'Q3H7', '3Z2O', 'TSXC', 'U0X2', 'BDK6', '4Y5D', 'CFGL', '0SXE', 'B7JY', 'KOGR',
  '7YTR', 'TR2J', 'D3DC', 'OYUG', '2YGQ', 'ZYYF', 'IC6P', 'GZHB', 'E7Z8', 'SPAC',
  '1CLJ', 'M39C', '027J', 'VGEQ', 'JGW7', '51VZ', 'LB5A', 'FVYN', 'KCN6', 'H7LK',
  'VJO4', 'ML98', 'GXBT', 'KSAX', 'VQTU', '44WI', '6K6J', '4P43', 'ORA2', 'XUS3',
  'CX33', 'WVGM', 'S3RX', 'SJI3', '6Q3F', 'KT43', 'DLOH', 'XMR0', 'NWIT', 'L1LL',
  'QPGB', 'JKVC', 'GO5F', 'CWWX', 'JXUG', 'EKXN', '5WS1', '2XH1', 'OZD6', 'RQN9',
  '0UOS', 'XWD0', '8GF5', 'TTET', 'DFOS', '2O4Z', 'GGAO', '9A76', 'COCZ', 'JMHL',
  '9C5V', 'BD86', 'OMP5', 'WN7T', 'D5W6', 'GEFB', 'FPZR', 'DSSP', '18UB', 'ZMSO'
);
```

## Support

For technical issues:
- Check Supabase logs for database errors
- Verify API endpoint: `/api/discount/validate`
- Test with sample codes: `4785`, `YL9V`, `SVA4`

For business questions:
- Contact: 0345205918 (Mr. Tiên) | 0961726061 (Ms. Giang)

---

## Quick Reference

### **Campaign Summary:**
- **100 unique codes** with conditional discount logic
- **Validity**: Oct 17 - Nov 17, 2025
- **Usage**: Single-use only
- **Discount**: 10% (with gift box) or 15% (without gift box) off first item
- **Tracking**: Automatic usage tracking and invalidation

### **Key Features:**
- ✅ Conditional discount based on gift box selection
- ✅ Single-use enforcement
- ✅ Date-based validity
- ✅ First-item-only application
- ✅ Automatic usage tracking
- ✅ Real-time validation
