# Mailing Script Updates - Order Data Integration

## Summary
Updated `mailing.gs` to properly integrate with the new order data structure from the Pixself Studio checkout API. The email automation now correctly handles all product variations, pricing breakdowns, and delivery options.

---

## Changes Made

### 1. **Updated Pricing Constants**
Added new pricing constants to match the full product catalog:

```javascript
const UNIT_PRICE = 49000;         // Base keychain price
const CHARM_PRICE = 6000;         // Sac Viet Charm
const GIFT_BOX_PRICE = 40000;     // 20.10 Gift Box
const SHIPPING_DELIVERY = 20000;  // Home delivery fee
```

### 2. **Updated Order Data Processing**
Modified `buildEmailDataFromOrder()` to properly extract pricing from the API payload:

**Before:**
- Only calculated base keychain price + charms
- Manual calculation of totals

**After:**
- Uses `orderData.pricing.itemsTotal` for base keychains
- Uses `orderData.pricing.charmsTotal` for all charms
- Uses `orderData.pricing.giftBoxTotal` for gift boxes
- Uses `orderData.pricing.extraItemsTotal` for extra items
- Uses `orderData.pricing.shippingCost` for shipping
- Uses `orderData.pricing.totalPrice` for final total

### 3. **Enhanced Item Display**
Updated both plain text and HTML email templates to show all product options:

**Per-Item Display:**
```
Keychain #1: "PIXSELF" + Sac Viet Charm + 20.10 Gift Box
Keychain #2: "DEMO" + Extra Items
```

**Pricing Breakdown:**
```
Tạm tính (2 keychains): 98.000 VND
Sac Viet Charm: 6.000 VND
20.10 Gift Box: 40.000 VND
Extra Items: [amount] VND
Giảm giá: -[amount] VND (CODE %)
Phí vận chuyển: 20.000 VND
Tổng cộng: [total] VND
```

### 4. **Updated Delivery Times**
Changed delivery estimates to match current fulfillment times:

- **Pickup at NEU**: ~4-5 ngày (changed from 3-5 days)
- **Home Delivery**: ~3-5 ngày

### 5. **Improved Data Structure**
The script now expects this order data structure from the n8n webhook:

```javascript
{
  orderId: "PIXSELF-...",
  customer: {
    name: "Customer Name",
    email: "customer@email.com",
    phone: "+84...",
    facebook: "...",
    instagram: "..."
  },
  items: [
    {
      id: "...",
      nametag: "PIXSELF",
      hasCharm: true,
      hasGiftBox: true,
      hasExtraItems: false
    }
  ],
  pricing: {
    itemsTotal: 49000,
    charmsTotal: 6000,
    giftBoxTotal: 40000,
    extraItemsTotal: 0,
    shippingCost: 20000,
    totalPrice: 115000
  },
  shipping: {
    option: "pickup",  // or "delivery"
    address: {
      street: "...",
      district: "...",
      city: "..."
    }
  },
  discountCode: "PIX10",
  paymentProofUrl: "...",
  timestamp: "2024-...",
  estimatedDelivery: "Ready for pickup in 4-5 days"
}
```

---

## Testing

### How to Test the Updated Script

1. **Deploy to Google Apps Script**:
   - Open your Google Apps Script project
   - Replace the code in `mailing.gs` with the updated version
   - Save and deploy as a web app

2. **Test with n8n Webhook**:
   - The script expects POST requests at the webhook URL
   - Send test data with the structure shown above
   - Check that the email is sent with correct formatting

3. **Verify Email Content**:
   - Check that all items are listed with their add-ons
   - Verify pricing breakdown shows all line items
   - Confirm delivery time matches shipping option
   - Ensure total calculations are correct

---

## Migration Notes

### For Existing Orders
The script includes fallback logic:
- If `orderData.pricing` is missing, it calculates from items
- If `orderData.pricing.totalPrice` is missing, it calculates the total
- This ensures backward compatibility with any existing integrations

### For New Features
To add new product options in the future:
1. Add pricing constant at the top of the file
2. Update `orderData.pricing` structure in API
3. Add display logic in both plain text and HTML sections
4. Update this documentation

---

## Related Files

- **API Order Handler**: `app/api/orders/route.ts`
- **Email Webhook Function**: `triggerEmailWebhook()` in orders API
- **n8n Workflow**: Configured with webhook URLs in `.env.local`
- **Database Schema**: `supabase-schema.sql` (includes `has_gift_box`, `has_extra_items` columns)

---

## Troubleshooting

### Email Not Sending
1. Check Google Apps Script execution logs
2. Verify webhook URL is correct in `.env.local`
3. Ensure script has Gmail permissions
4. Check that `orderData.customer.email` is valid

### Wrong Pricing
1. Verify `orderData.pricing` object is complete
2. Check that all constants match current prices
3. Review discount code calculation in `COUPON_MAP`

### Missing Items
1. Ensure all items have `nametag` property
2. Check that boolean flags (`hasCharm`, `hasGiftBox`, etc.) are set
3. Verify items array is not empty

---

## Support

For issues or questions:
- Check the main project README
- Review `N8N_INTEGRATION_GUIDE.md`
- Contact: 0345205918 (Mr. Tiên) | 0961726061 (Ms. Giang)

