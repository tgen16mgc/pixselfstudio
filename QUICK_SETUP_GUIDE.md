# 🚀 Quick Setup Guide - Get Your Backend Working

## ✅ Current Status
- ✅ **API is working**: Your `/api/orders` endpoint is responding
- ✅ **Checkout form**: Frontend is ready to submit orders
- ⏳ **Database**: Need to configure Supabase to save orders permanently

---

## 🎯 **Option 1: Test Without Database (5 minutes)**

**Your system is already working!** Orders will be logged to console but not saved permanently.

### Test it now:
1. **Go to**: `http://localhost:3000`
2. **Create a keychain**: Customize your character
3. **Add to cart**: Click "ADD TO CART" 
4. **Go to checkout**: Click cart icon → "Checkout"
5. **Fill form**: Add your details and upload a fake payment screenshot
6. **Submit**: Check your terminal for the order log!

---

## 🎯 **Option 2: Full Database Setup (30 minutes)**

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create new project: `pixself-studio`
4. Choose region: `Southeast Asia (Singapore)`
5. Wait for setup (2-3 minutes)

### Step 2: Run Database Schema
1. **In Supabase Dashboard**: Go to "SQL Editor"
2. **Copy & paste** this SQL:

\`\`\`sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  png_data_url TEXT NOT NULL,
  nametag TEXT NOT NULL,
  has_charm BOOLEAN DEFAULT FALSE,
  item_price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('order-files', 'order-files', true);
\`\`\`

3. **Click "Run"**

### Step 3: Get API Keys
1. **In Supabase**: Go to "Settings" → "API"
2. **Copy these values**:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 4: Add Environment Variables
**Create file `.env.local` in your project root:**

\`\`\`bash
# Replace with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
\`\`\`

### Step 5: Enable Database Code
**Uncomment the Supabase imports in your API:**

1. **Edit**: `app/api/orders/route.ts`
2. **Change line 2-3** from:
   \`\`\`typescript
   // Temporarily comment out Supabase imports until env vars are set up
   // import { createOrder, uploadPaymentProof } from '@/lib/supabase'
   \`\`\`
   
   **To**:
   \`\`\`typescript
   import { createOrder, uploadPaymentProof } from '@/lib/supabase'
   \`\`\`

3. **Replace lines 69-83** with:
   \`\`\`typescript
   // Save order to Supabase database
   console.log('📦 Saving order to database:', orderId)
   const order = await createOrder({ orderId, ...orderData })
   
   // Upload payment proof to Supabase storage
   console.log('📄 Uploading payment proof...')
   const paymentProofUrl = await uploadPaymentProof(paymentProof, orderId)
   \`\`\`

### Step 6: Restart Server
\`\`\`bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
npm run dev
\`\`\`

---

## 🎯 **Option 3: Simple Spreadsheet Database (15 minutes)**

If Supabase feels too complex, use **Airtable** instead:

1. **Create Airtable account**: [airtable.com](https://airtable.com)
2. **Create base**: "Pixself Orders"
3. **Add tables**: Orders, Order Items
4. **Get API key**: Account → API
5. **Install**: `npm install airtable`
6. **Update API**: Use Airtable instead of Supabase

---

## 🔍 **Troubleshooting**

### "SyntaxError: Unexpected token '<'"
- **Cause**: Missing environment variables
- **Fix**: Make sure `.env.local` exists with correct Supabase keys

### Server hangs on API requests
- **Cause**: Import errors in Supabase code
- **Fix**: Follow Step 5 above to uncomment imports properly

### Orders not showing in admin
- **Cause**: Database not connected
- **Fix**: Complete Supabase setup or use Option 1 for testing

---

## 🎉 **What You'll Have When Done**

- ✅ **Working checkout**: Customers can place orders
- ✅ **Order management**: View all orders at `/admin`
- ✅ **File uploads**: Payment proofs stored securely
- ✅ **Real database**: Orders saved permanently
- ✅ **Admin dashboard**: Beautiful order management interface

---

## 🤔 **Need Help?**

**Choose your path:**
1. **Just want to test?** → Use Option 1 (already working!)
2. **Want full features?** → Use Option 2 (Supabase)
3. **Want simple setup?** → Use Option 3 (Airtable)

**Which option would you like to pursue?** I can help you with any of these approaches!
