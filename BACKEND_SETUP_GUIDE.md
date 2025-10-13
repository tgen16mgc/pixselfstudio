# 🚀 Pixself Backend Setup Guide

## Current Status
✅ **Basic API endpoint created** at `/app/api/orders/route.ts`  
✅ **Frontend integrated** with API calls  
⏳ **Next steps**: Choose your backend approach below

---

## 🎯 **Approach 1: Next.js API + Simple Database (Recommended for MVP)**

### **What you have now:**
- ✅ API endpoint that receives orders
- ✅ File upload handling for payment proofs
- ✅ Order validation and ID generation

### **Next steps to complete:**

#### **Step 1: Add Database (Choose one)**

**Option A: SQLite (Easiest for development)**
```bash
npm install sqlite3 @types/sqlite3
```

**Option B: PostgreSQL (Recommended for production)**
```bash
npm install pg @types/pg
# Or use a service like Supabase, Neon, or Railway
```

**Option C: MongoDB (If you prefer NoSQL)**
```bash
npm install mongodb
```

#### **Step 2: Add Email Service**
```bash
npm install nodemailer @types/nodemailer
# Or use services like Resend, SendGrid, or Mailgun
```

#### **Step 3: Add File Storage**
```bash
# For local storage (development)
npm install multer @types/multer

# For cloud storage (production)
npm install @aws-sdk/client-s3  # AWS S3
# OR
npm install cloudinary  # Cloudinary
# OR use Vercel Blob, Supabase Storage
```

---

## 🎯 **Approach 2: External Backend Service (No Code/Low Code)**

### **Option A: Supabase (Recommended)**
- **Database**: PostgreSQL with real-time features
- **Storage**: File uploads for payment proofs and PNGs
- **Auth**: If you need admin login later
- **Edge Functions**: For order processing logic

```bash
npm install @supabase/supabase-js
```

**Setup:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Set up tables for orders, order_items
4. Configure storage bucket for files
5. Get API keys and add to `.env.local`

### **Option B: Firebase**
```bash
npm install firebase firebase-admin
```

### **Option C: Airtable (Super Simple)**
```bash
npm install airtable
```
- Use Airtable as your database
- Perfect for non-technical team members to manage orders
- Built-in admin interface

---

## 🎯 **Approach 3: Full Backend Framework**

### **Option A: Express.js Server**
Create a separate Express server for more control:

```bash
mkdir pixself-backend
cd pixself-backend
npm init -y
npm install express cors multer nodemailer sqlite3
```

### **Option B: Nest.js (Enterprise)**
If you want a robust, scalable backend:

```bash
npm i -g @nestjs/cli
nest new pixself-backend
```

---

## 📋 **Database Schema (for any SQL approach)**

```sql
-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_social TEXT,
  shipping_option TEXT NOT NULL, -- 'pickup' or 'delivery'
  shipping_address TEXT, -- JSON string if delivery
  discount_code TEXT,
  total_price INTEGER NOT NULL, -- in VND
  payment_proof_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, shipped, delivered
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  png_data_url TEXT NOT NULL, -- base64 PNG data
  nametag TEXT NOT NULL,
  has_charm BOOLEAN DEFAULT FALSE,
  item_price INTEGER NOT NULL, -- in VND
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders (id)
);
```

---

## 🔧 **Immediate Next Steps (Choose Your Path)**

### **Quick MVP (1-2 hours):**
1. **Use Airtable** - Create tables, get API key, update your API route
2. **Use local file storage** for payment proofs (save to `/public/uploads/`)
3. **Use console.log** for now instead of email notifications

### **Production Ready (1-2 days):**
1. **Set up Supabase** - Database + file storage + real-time features
2. **Add Resend** for email notifications
3. **Add proper error handling** and logging
4. **Create admin dashboard** to manage orders

### **Enterprise (1 week):**
1. **Set up PostgreSQL** with proper hosting
2. **Add Redis** for caching and job queues
3. **Set up proper CI/CD** pipeline
4. **Add monitoring** and analytics
5. **Create comprehensive admin system**

---

## 🎨 **Admin Dashboard Ideas**

Once you have data flowing, you'll want to manage orders:

1. **Simple**: Use Airtable's built-in interface
2. **Custom**: Build a Next.js admin page at `/admin`
3. **Third-party**: Use tools like Retool, AdminJS, or Supabase Dashboard

---

## 💡 **Recommended Starting Point**

For Pixself, I recommend starting with:

1. **Supabase** for database and file storage
2. **Resend** for emails
3. **Vercel** for hosting (you're already using Next.js)

This gives you:
- ✅ Real-time order tracking
- ✅ Automatic file storage for payment proofs and PNGs
- ✅ Built-in admin interface
- ✅ Scalable and production-ready
- ✅ Free tier available

**Time to implement**: 2-4 hours  
**Monthly cost**: $0-20 USD for moderate traffic

---

## 📞 **Need Help?**

1. **Supabase Setup**: I can help you set up the database schema and API integration
2. **Email Templates**: I can create order confirmation and admin notification emails
3. **Admin Dashboard**: I can build a simple order management interface
4. **File Storage**: I can set up proper image handling for payment proofs and keychain PNGs

Let me know which approach you'd like to pursue!
