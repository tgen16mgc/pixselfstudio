# 🚀 PixSelf Studio Deployment Guide

## Environment Variables Setup

### Required Environment Variables

Set these in your hosting platform (Vercel, Netlify, Railway, etc.):

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# N8N Webhook Integration (Optional)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/order-completed
N8N_WEBHOOK_TEST_URL=https://your-n8n-instance.com/webhook/test

# Environment
NODE_ENV=production
```

### Platform-Specific Instructions

#### Vercel
1. Go to your project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable above
4. Redeploy your project

#### Netlify
1. Go to Site settings → Environment variables
2. Add each variable
3. Redeploy from Deploys tab

#### Railway
1. Go to your project
2. Navigate to Variables tab
3. Add each variable
4. Redeploy

### Supabase Setup

1. **Create Supabase Project**: https://supabase.com/dashboard
2. **Get your credentials**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - API → anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - API → service_role → `SUPABASE_SERVICE_ROLE_KEY`

3. **Run the database schema**:
   ```sql
   -- Copy and run the contents of supabase-schema.sql in your Supabase SQL editor
   ```

### Testing Your Deployment

1. **Check environment variables**:
   ```bash
   # Add this to your API route temporarily for debugging
   console.log('Environment check:', {
     hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
     hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
     hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
     nodeEnv: process.env.NODE_ENV
   })
   ```

2. **Test the API endpoint**:
   ```bash
   curl -X POST https://your-domain.com/api/orders \
     -F "orderData={\"test\":\"data\"}" \
     -F "paymentProof=@test-image.jpg"
   ```

### Common Issues & Solutions

#### Issue: "Missing environment variable" error
**Solution**: Double-check all environment variables are set in your hosting platform

#### Issue: "Supabase client not initialized" error  
**Solution**: Verify your Supabase URL and keys are correct

#### Issue: "Failed to process order" error
**Solution**: Check your Supabase database schema is properly set up

#### Issue: API works locally but not in production
**Solution**: 
1. Verify environment variables are set in production
2. Check if your hosting platform supports file uploads
3. Ensure CORS is properly configured

### Database Schema

Make sure to run the SQL schema in `supabase-schema.sql` in your Supabase project:

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Paste the contents of `supabase-schema.sql`
4. Run the script

### File Upload Considerations

Some hosting platforms have file size limits:
- Vercel: 4.5MB for serverless functions
- Netlify: 6MB for serverless functions
- Railway: 10MB

If you need larger files, consider:
1. Using Supabase Storage directly
2. Implementing chunked uploads
3. Using a dedicated file storage service

### Monitoring & Debugging

1. **Check logs** in your hosting platform
2. **Monitor Supabase** dashboard for database activity
3. **Test API endpoints** using curl or Postman
4. **Use browser dev tools** to check network requests

### Security Notes

- Never commit environment variables to git
- Use service role key only on server-side
- Implement proper CORS settings
- Consider rate limiting for production
