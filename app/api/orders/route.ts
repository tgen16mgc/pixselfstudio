import { NextRequest, NextResponse } from 'next/server'
import { createOrder, uploadPaymentProof } from '@/lib/supabase'

// Google Apps Script email webhook integration
async function triggerEmailWebhook(orderData: any) {
  const googleScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!googleScriptUrl) {
    console.log('⚠️ GOOGLE_APPS_SCRIPT_URL not configured, skipping email webhook');
    return;
  }

  console.log('📧 Triggering Google Apps Script email webhook...');

  try {
    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'order_completed',
        data: orderData
      })
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Google Apps Script email webhook triggered successfully:', result);

  } catch (error) {
    console.error('❌ Google Apps Script email webhook failed:', error);
    // Don't throw - email failure shouldn't fail the order
  }
}

// n8n webhook integration
async function triggerN8nWebhook(orderData: any) {
  // Prefer dedicated test webhook when not in production
  const isProd = process.env.NODE_ENV === 'production'
  const testUrl = process.env.N8N_WEBHOOK_TEST_URL
  const prodUrl = process.env.N8N_WEBHOOK_URL
  const n8nWebhookUrl = isProd ? prodUrl : (testUrl || prodUrl)

  if (!n8nWebhookUrl) {
    console.log('⚠️ N8N_WEBHOOK_URL not configured, skipping webhook')
    return
  }

  console.log('🔔 Triggering n8n webhook:', {
    env: process.env.NODE_ENV,
    url: n8nWebhookUrl?.slice(0, 60) + '...'
  })

  // 1) Try POST first (recommended for n8n production webhooks)
  const payload = {
    event: 'order_completed',
    data: orderData
  }

  let response: Response | undefined
  try {
    response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
  } catch (e) {
    // Network error on POST – we'll try GET next
  }

  // 2) If POST returned 404/405 or failed, try GET fallback (useful for some n8n test webhooks)
  if (!response || response.status === 404 || response.status === 405) {
    const url = new URL(n8nWebhookUrl)
    url.searchParams.set('event', 'order_completed')
    if (orderData?.orderId) url.searchParams.set('orderId', String(orderData.orderId))
    url.searchParams.set('env', process.env.NODE_ENV || 'development')
    // Send compact payload for debugging
    try {
      url.searchParams.set('payload', encodeURIComponent(JSON.stringify(payload)))
    } catch {}

    response = await fetch(url.toString(), { method: 'GET' })
  }

  if (!response.ok) {
    // Log the error but don't throw - webhook failure shouldn't break the order
    console.warn(`⚠️ n8n webhook returned ${response.status}: ${response.statusText}`)
    return { ok: false, status: response.status }
  }

  // n8n may return 204 No Content
  if (response.status === 204) return { ok: true }

  // Try to parse JSON; fallback to text
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return { ok: true, body: text }
  }
}

// Mark discount code as used (increment usage_count)
async function markDiscountCodeAsUsed(code: string) {
  const { supabaseAdmin } = await import('@/lib/supabase')
  
  // First get current usage count
  const { data: currentData, error: fetchError } = await supabaseAdmin
    .from('discount_codes')
    .select('usage_count')
    .eq('code', code.toUpperCase())
    .single()
  
  if (fetchError) {
    throw new Error(`Failed to fetch discount code: ${fetchError.message}`)
  }
  
  // Increment usage count
  const { error } = await supabaseAdmin
    .from('discount_codes')
    .update({ 
      usage_count: (currentData.usage_count || 0) + 1
    })
    .eq('code', code.toUpperCase())
  
  if (error) {
    throw new Error(`Failed to mark discount code as used: ${error.message}`)
  }
}

// Types for your order data
interface OrderItem {
  id: string
  pngDataUrl: string
  nametag: string
  hasCharm: boolean
  createdAt: string
}

interface OrderData {
  items: OrderItem[]
  formData: {
    fullName: string
    phone: string
    email: string
    socialMedia: string
    shippingOption: 'pickup' | 'delivery'
    address: {
      street: string
      district: string
      city: string
    }
    discountCode: string
  }
  totalPrice: number
  paymentProof?: File
  discountAmount?: number
  discountData?: any
}

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables (remove in production)
    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)
    })

    // Parse form data (includes file upload)
    const formData = await request.formData()
    
    // Extract order data
    const orderDataString = formData.get('orderData') as string
    const paymentProof = formData.get('paymentProof') as File
    
    if (!orderDataString) {
      return NextResponse.json(
        { error: 'Missing order data' },
        { status: 400 }
      )
    }

    const orderData: OrderData = JSON.parse(orderDataString)

    // Validate required fields
    if (!orderData.formData.fullName || !orderData.formData.phone || !orderData.formData.email) {
      return NextResponse.json(
        { error: 'Missing required personal information' },
        { status: 400 }
      )
    }

    if (!paymentProof) {
      return NextResponse.json(
        { error: 'Payment proof is required' },
        { status: 400 }
      )
    }

    // Generate order ID
    const orderId = `PIXSELF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Save order to Supabase database
    console.log('📦 Saving order to database:', orderId)
    const order = await createOrder({ orderId, ...orderData })
    
    // Upload payment proof to Supabase storage
    console.log('📄 Uploading payment proof...')
    const paymentProofUrl = await uploadPaymentProof(paymentProof, orderId)
    
    console.log('✅ Order saved successfully:', {
      orderId,
      customer: orderData.formData.fullName,
      email: orderData.formData.email,
      phone: orderData.formData.phone,
      items: orderData.items.length,
      total: orderData.totalPrice,
      shipping: orderData.formData.shippingOption,
      paymentProofUrl
    })

    // Mark discount/gift code as used if applied
    // Check for discount code in formData or discountData (for gift codes)
    const codeToMark = orderData.formData.discountCode || (orderData.discountData?.code)
    const isGiftCode = orderData.discountData?.isGiftCode || orderData.discountData?.discountType === 'gift'
    const discountAmount = orderData.discountAmount || 0
    
    // Mark as used if there's a code and either:
    // - It's a discount code (discountAmount > 0), OR
    // - It's a gift code (isGiftCode = true)
    if (codeToMark && (discountAmount > 0 || isGiftCode)) {
      try {
        await markDiscountCodeAsUsed(codeToMark)
        console.log('✅ Code marked as used:', codeToMark, isGiftCode ? '(gift code)' : '(discount code)')
      } catch (error) {
        console.error('⚠️ Failed to mark code as used:', error)
        // Don't fail the order if code tracking fails
      }
    }

    // 🔔 Trigger email webhook for order confirmation email
    try {
      await triggerEmailWebhook({
        orderId,
        customer: {
          name: orderData.formData.fullName,
          email: orderData.formData.email,
          phone: orderData.formData.phone,
          facebook: orderData.formData.socialMedia || '',
          instagram: orderData.formData.socialMedia || ''
        },
        items: orderData.items.map((item: any) => ({
          id: item.id,
          nametag: item.nametag,
          hasCharm: item.hasCharm,
          hasGiftBox: item.hasGiftBox,
          hasExtraItems: item.hasExtraItems,
          pngPreview: item.pngDataUrl ? 'included' : 'missing'
        })),
        pricing: {
          itemsTotal: orderData.items.length * 49000,
          charmsTotal: orderData.items.filter((item: any) => item.hasCharm).length * 6000,
          giftBoxTotal: orderData.items.filter((item: any) => item.hasGiftBox).length * 40000,
          extraItemsTotal: orderData.items.filter((item: any) => item.hasExtraItems).length * 0,
          shippingCost: orderData.formData.shippingOption === 'delivery' ? 20000 : 0,
          discountAmount: orderData.discountAmount || 0,
          totalPrice: orderData.totalPrice
        },
        shipping: {
          option: orderData.formData.shippingOption,
          address: orderData.formData.address || null
        },
        paymentProofUrl,
        discountCode: orderData.formData.discountCode || null,
        timestamp: new Date().toISOString(),
        estimatedDelivery: orderData.formData.shippingOption === 'pickup'
          ? 'Ready for pickup in 4-5 days'
          : 'Delivery in 3-5 days'
      })
      console.log('📧 Email webhook triggered successfully')
    } catch (webhookError) {
      // Don't fail the order if webhook fails - just log it
      console.error('⚠️ Email webhook failed (order still saved):', webhookError)
    }

    // 🔔 Trigger n8n webhook for order notification (existing functionality)
    try {
      await triggerN8nWebhook({
        orderId,
        customer: {
          name: orderData.formData.fullName,
          email: orderData.formData.email,
          phone: orderData.formData.phone,
          facebook: orderData.formData.socialMedia || '',
          instagram: orderData.formData.socialMedia || ''
        },
        items: orderData.items.map((item: any) => ({
          id: item.id,
          nametag: item.nametag,
          hasCharm: item.hasCharm,
          pngPreview: item.pngDataUrl ? 'included' : 'missing'
        })),
        pricing: {
          itemsTotal: orderData.items.length * 49000,
          charmsTotal: orderData.items.filter((item: any) => item.hasCharm).length * 6000,
          shippingCost: orderData.formData.shippingOption === 'delivery' ? 20000 : 0,
          totalPrice: orderData.totalPrice
        },
        shipping: {
          option: orderData.formData.shippingOption,
          address: orderData.formData.address || null
        },
        paymentProofUrl,
        discountCode: orderData.formData.discountCode || null,
        timestamp: new Date().toISOString(),
        estimatedDelivery: orderData.formData.shippingOption === 'pickup'
          ? 'Ready for pickup in 4-5 days'
          : 'Delivery in 3-5 days'
      })
      console.log('🔔 n8n webhook triggered successfully')
    } catch (webhookError) {
      // Don't fail the order if webhook fails - just log it
      console.error('⚠️ n8n webhook failed (order still saved):', webhookError)
    }

    // TODO: Send confirmation email
    // await sendOrderConfirmationEmail(orderData, orderId)

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order submitted successfully! We will contact you soon.',
      estimatedDelivery: orderData.formData.shippingOption === 'pickup' 
        ? 'Ready for pickup in 4-5 days'
        : 'Delivery in 3-5 days'
    })

  } catch (error) {
    console.error('❌ Order submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve order status (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID is required' },
      { status: 400 }
    )
  }

  // TODO: Fetch from database
  // For now, return mock data
  return NextResponse.json({
    orderId,
    status: 'processing',
    estimatedCompletion: '2-3 days',
    items: 1
  })
}
