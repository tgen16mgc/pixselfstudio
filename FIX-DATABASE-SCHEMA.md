# Fix Database Schema - Add Missing Columns

## Problem
The checkout is failing with error: `Could not find the 'has_extra_items' column of 'order_items' in the schema cache`

This is because the `order_items` table is missing two columns:
- `has_gift_box`
- `has_extra_items`

## Solution

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration SQL

Copy and paste this SQL into the editor:

```sql
-- Add missing columns to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS has_gift_box BOOLEAN DEFAULT FALSE;

ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS has_extra_items BOOLEAN DEFAULT FALSE;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;
```

### Step 3: Run the Query

Click the **Run** button (or press Ctrl/Cmd + Enter)

### Step 4: Verify

You should see output showing all columns in the `order_items` table, including:
- `id`
- `order_id`
- `png_data_url`
- `nametag`
- `has_charm`
- `has_gift_box` ✅ (newly added)
- `has_extra_items` ✅ (newly added)
- `item_price`
- `created_at`

### Step 5: Test Checkout

Go back to your website and try placing an order again. It should work now!

## Alternative: Use the SQL File

I've created a file called `add-missing-columns.sql` in your project root. You can:

1. Open it
2. Copy all the contents
3. Paste into Supabase SQL Editor
4. Run it

## What These Columns Do

- **`has_gift_box`**: Tracks if the customer added the "20.10 Gift Box" option (+40,000 VND)
- **`has_extra_items`**: Tracks if the customer added "Extra Items + Gift Packaging" option

These are used for pricing calculations and order tracking.

