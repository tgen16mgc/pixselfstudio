# 🚀 Google Apps Script Email Automation Setup

## Overview

This guide shows you how to deploy your `mailing.gs` script as a webhook that automatically sends confirmation emails when orders are placed through your PixSelf Studio checkout system.

## Step 1: Deploy the Google Apps Script

1. **Open Google Apps Script**:
   - Go to [https://script.google.com](https://script.google.com)
   - Sign in with your Google account

2. **Create New Project**:
   - Click "New project"
   - Copy and paste the contents of your `mailing.gs` file

3. **Deploy as Web App**:
   - Click "Deploy" → "New deployment"
   - Select "Web app"
   - Set these options:
     - **Execute as**: "Me" (your Google account)
     - **Who has access**: "Anyone"
   - Click "Deploy"

4. **Copy the Web App URL**:
   - After deployment, you'll get a URL like:
     `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
   - Copy this URL - you'll need it for the environment variable

## Step 2: Configure Environment Variable

Add this to your `.env.local` file (and your hosting platform's environment variables):

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Step 3: Test the Integration

1. **Deploy your Next.js app** with the new environment variable
2. **Place a test order** through your checkout system
3. **Check your Gmail** - you should receive the confirmation email

## Troubleshooting

### Email not sending?
- **Check permissions**: Make sure the script is deployed as "Me" and accessible to "Anyone"
- **Verify Gmail access**: The script uses `GmailApp.sendEmail()` which requires Gmail API access
- **Check logs**: View execution logs in Google Apps Script dashboard

### Webhook failing?
- **Check URL format**: Must be the full web app URL ending in `/exec`
- **Verify JSON format**: The webhook expects `{ "event": "order_completed", "data": orderData }`
- **Check environment variable**: Make sure `GOOGLE_APPS_SCRIPT_URL` is set correctly

### Common Error Messages:
- `"Không tìm thấy email khách hàng"` → Missing customer email in order data
- `"Google Apps Script webhook failed"` → Check deployment URL and permissions

## Security Notes

- The webhook is public (accessible to anyone with the URL)
- Consider adding authentication if needed
- Monitor usage in Google Apps Script dashboard
- The script processes all POST requests to the webhook URL

## Monitoring

- **Google Apps Script Dashboard**: View execution logs and usage
- **Gmail Sent Mail**: Check if emails are being sent
- **Your hosting platform logs**: Check for webhook errors

## Next Steps

Once working, you can:
1. Customize the email template further
2. Add more webhook events (order updates, cancellations)
3. Set up email tracking or analytics
4. Integrate with other Google services (Sheets, Drive, etc.)
