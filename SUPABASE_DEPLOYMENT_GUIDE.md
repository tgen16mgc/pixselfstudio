# 🚀 Supabase Configuration for Production Deployment

## Overview

This guide explains how to configure Supabase environment variables for your PixSelf Studio admin panel in production.

## Required Environment Variables

You need to set these 3 environment variables in your hosting platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Navigate to Settings → API**
4. **Copy these values**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Configure in Your Hosting Platform

### Vercel (Recommended)
1. Go to your **Vercel Dashboard**
2. Navigate to your project
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIs...
   ```
5. **Redeploy** your project

### Netlify
1. Go to your **Site Settings**
2. Navigate to **Environment variables**
3. Add each variable:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIs...
   ```
4. **Redeploy** from the **Deploys** tab

### Railway
1. Go to your **Railway Dashboard**
2. Navigate to your project
3. Click **Variables** tab
4. Add each variable:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIs...
   ```
5. **Redeploy** your service

## Step 3: Verify Configuration

1. **Deploy your updated code**
2. **Visit your admin page**: `https://your-domain.com/pxadmin220805`
3. **Check browser console** for Supabase initialization logs
4. **Verify orders load** in the admin interface

## Troubleshooting

### Error: "supabaseKey is required"
**Cause**: Environment variables not set in production
**Solution**: Follow the platform-specific instructions above

### Error: "Failed to load orders"
**Cause**: Incorrect Supabase credentials or network issues
**Solution**:
1. Double-check your Project URL and API keys
2. Ensure your Supabase project is active
3. Check your hosting platform's environment variable settings

### Error: "Missing NEXT_PUBLIC_SUPABASE_URL"
**Cause**: NEXT_PUBLIC_SUPABASE_URL not configured
**Solution**: Set the correct Supabase project URL

### Error: "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY"
**Cause**: NEXT_PUBLIC_SUPABASE_ANON_KEY not configured
**Solution**: Set the correct anon/public API key

## Security Notes

- **Never commit** these environment variables to your repository
- **Use service role key only on server-side** (already handled in your code)
- **Keep your API keys secure** and rotate them periodically
- **Monitor your Supabase usage** in the dashboard

## Database Schema

Make sure your Supabase database has these tables:

```sql
-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_social TEXT,
  shipping_option TEXT NOT NULL,
  shipping_address JSONB,
  discount_code TEXT,
  total_price INTEGER NOT NULL,
  payment_proof_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  png_data_url TEXT NOT NULL,
  nametag TEXT NOT NULL,
  has_charm BOOLEAN DEFAULT FALSE,
  item_price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing Your Setup

1. **Place a test order** through your checkout system
2. **Check the admin page** - new order should appear
3. **Verify all data** is displayed correctly
4. **Test payment proof links** work properly

## Support

If you continue having issues:
1. Check your hosting platform's documentation for environment variables
2. Verify your Supabase project is active and accessible
3. Ensure your API keys have the correct permissions
4. Check the browser console for detailed error messages

## Quick Check Commands

```bash
# Check if environment variables are set (run in your hosting platform)
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY

# Test Supabase connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/orders?limit=1"
```
