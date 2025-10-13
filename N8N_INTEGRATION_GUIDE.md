# 🔔 n8n Integration Guide for Pixself Studio

This guide explains how to set up n8n workflows to automatically handle order notifications when customers complete payments.

## 🚀 Quick Setup

### 1. **Set Up n8n Webhook**

In your n8n instance:

1. **Create a new workflow**
2. **Add a Webhook node** as the trigger
3. **Configure the webhook:**
   - **HTTP Method**: `POST`
   - **Path**: `/webhook/pixself-order` (or your preferred path)
   - **Authentication**: None (or add if needed)

4. **Copy the webhook URL** - it should look like:
   ```
   https://your-n8n-instance.com/webhook/pixself-order
   ```

### 2. **Update Environment Variables**

Add your n8n webhook URL to `.env.local`:

```bash
# n8n Webhook Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/pixself-order
```

### 3. **Restart Your Development Server**

```bash
npm run dev
```

## 📦 Order Data Structure

When a customer completes an order, your n8n webhook will receive this data:

```json
{
  "event": "order_completed",
  "data": {
    "orderId": "PIXSELF-1759162614687-9BM21723H",
    "customer": {
      "name": "Duong Ngoc Tien",
      "email": "tienhhannh@gmail.com",
      "phone": "0345205919",
      "facebook": "facebook.com/user",
      "instagram": "@instagram_user"
    },
    "items": [
      {
        "id": "item_1",
        "nametag": "TIEN",
        "hasCharm": true,
        "pngPreview": "included"
      }
    ],
    "pricing": {
      "itemsTotal": 49000,
      "charmsTotal": 6000,
      "shippingCost": 20000,
      "totalPrice": 75000
    },
    "shipping": {
      "option": "delivery",
      "address": "123 Main St, Ho Chi Minh City"
    },
    "paymentProofUrl": "https://supabase.co/storage/.../payment-proof.jpg",
    "discountCode": "SAVE10",
    "timestamp": "2025-01-29T15:30:14.687Z",
    "estimatedDelivery": "Delivery in 3-5 days"
  }
}
```

## 🔧 Example n8n Workflows

### **Workflow 1: Order Notification**

1. **Webhook Trigger** → Receives order data
2. **Email Node** → Send order confirmation to customer
3. **Slack/Discord Node** → Notify team about new order
4. **Supabase Node** → Update order status (optional)

### **Workflow 2: Admin Dashboard**

1. **Webhook Trigger** → Receives order data  
2. **Google Sheets Node** → Add order to tracking sheet
3. **Telegram Node** → Send admin notification
4. **HTTP Request Node** → Update external systems

### **Workflow 3: Customer Journey**

1. **Webhook Trigger** → Receives order data
2. **Wait Node** → Wait 1 day
3. **Email Node** → Send production update
4. **Wait Node** → Wait 2 more days  
5. **Email Node** → Send ready notification

## 📧 Email Templates

### **Customer Confirmation Email**

```html
<h1>🎉 Order Confirmed!</h1>
<p>Hi {{$json.data.customer.name}},</p>

<p>Thank you for your Pixself order! Here are the details:</p>

<ul>
  <li><strong>Order ID:</strong> {{$json.data.orderId}}</li>
  <li><strong>Items:</strong> {{$json.data.items.length}} keychain(s)</li>
  <li><strong>Total:</strong> {{$json.data.pricing.totalPrice.toLocaleString()}} VND</li>
  <li><strong>Estimated Delivery:</strong> {{$json.data.estimatedDelivery}}</li>
</ul>

<p>We'll start working on your custom keychains right away!</p>
```

### **Admin Notification**

```html
<h1>🚨 New Pixself Order</h1>

<ul>
  <li><strong>Customer:</strong> {{$json.data.customer.name}} ({{$json.data.customer.phone}})</li>
  <li><strong>Email:</strong> {{$json.data.customer.email}}</li>
  <li><strong>Items:</strong> {{$json.data.items.length}} keychains</li>
  <li><strong>Charms:</strong> {{$json.data.items.filter(item => item.hasCharm).length}}</li>
  <li><strong>Total:</strong> {{$json.data.pricing.totalPrice.toLocaleString()}} VND</li>
  <li><strong>Shipping:</strong> {{$json.data.shipping.option}}</li>
</ul>

<a href="{{$json.data.paymentProofUrl}}">View Payment Proof</a>
```

## 🔍 Testing Your Integration

### **Test with a Real Order:**

1. Go to `http://localhost:3000`
2. Create a character and add to cart
3. Complete the checkout process
4. Check your n8n workflow execution log

### **Manual Test:**

```bash
curl -X POST https://your-n8n-instance.com/webhook/pixself-order \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order_completed",
    "data": {
      "orderId": "TEST-ORDER-123",
      "customer": {
        "name": "Test Customer",
        "email": "test@example.com"
      }
    }
  }'
```

## 🛠 Advanced Features

### **Conditional Logic**

Add **IF nodes** to handle different scenarios:

- **VIP customers** → Send special handling notification
- **Large orders** → Alert production team  
- **International shipping** → Different workflow
- **Discount codes** → Track promotional effectiveness

### **Data Processing**

Use **Code nodes** to:

- Calculate production time based on item count
- Format Vietnamese phone numbers
- Generate tracking numbers
- Process custom requirements

### **External Integrations**

Connect to:

- **Google Calendar** → Schedule production slots
- **Trello/Asana** → Create production tasks  
- **WhatsApp API** → Send customer updates
- **Shopify** → Sync with e-commerce platform

## 🚨 Error Handling

The integration includes built-in error handling:

- ✅ **Order still saves** even if n8n webhook fails
- ✅ **Errors are logged** but don't break the checkout process
- ✅ **Retry logic** can be added to n8n workflows
- ✅ **Fallback notifications** via email/Slack

## 📊 Monitoring & Analytics

### **Track in n8n:**

- Order volume trends
- Customer acquisition sources  
- Popular product combinations
- Payment success rates
- Delivery performance

### **Set up Alerts:**

- Failed webhook calls
- High order volumes
- Payment issues
- System downtime

## 🔐 Security Considerations

### **Webhook Security:**

1. **Use HTTPS** for webhook URLs
2. **Add authentication** if handling sensitive data
3. **Validate webhook data** in n8n
4. **Rate limiting** to prevent abuse
5. **IP whitelisting** if possible

### **Data Privacy:**

- **Encrypt sensitive data** in n8n
- **Limit data retention** periods
- **Comply with GDPR/privacy laws**
- **Secure webhook endpoints**

---

## 🎯 Next Steps

1. **Set up your n8n webhook URL**
2. **Test with a sample order** 
3. **Create your first workflow**
4. **Monitor webhook calls**
5. **Scale with additional workflows**

Your Pixself orders will now automatically trigger n8n workflows! 🚀
