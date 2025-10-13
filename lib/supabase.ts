// Supabase setup - now active!
import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for debugging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if environment variables are available
const hasValidConfig = supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== ''

if (!hasValidConfig) {
  console.warn('⚠️ Supabase not configured:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
    isClient: typeof window !== 'undefined',
    allEnvKeys: typeof window !== 'undefined' ? 'CLIENT_SIDE' : Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
  })
}

// Create a mock client if configuration is missing (for graceful degradation)
const createMockClient = () => {
  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  }
}

// Initialize Supabase client only if configuration is valid
export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any

// Server-side client for API routes
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const supabaseAdmin = hasValidConfig && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createMockClient() as any

console.log('✅ Supabase client initialized:', {
  url: hasValidConfig ? supabaseUrl.substring(0, 30) + '...' : 'NOT_CONFIGURED',
  hasKey: !!supabaseAnonKey,
  isClient: typeof window !== 'undefined',
  configured: hasValidConfig
})

// Database helper functions
export async function createOrder(orderData: any) {
  if (!hasValidConfig) {
    throw new Error('Supabase not configured. Please set up environment variables in your hosting platform.')
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      id: orderData.orderId,
      customer_name: orderData.formData.fullName,
      customer_email: orderData.formData.email,
      customer_phone: orderData.formData.phone,
      customer_social: orderData.formData.socialMedia,
      shipping_option: orderData.formData.shippingOption,
      shipping_address: orderData.formData.shippingOption === 'delivery'
        ? JSON.stringify(orderData.formData.address)
        : null,
      discount_code: orderData.formData.discountCode,
      total_price: orderData.totalPrice,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Insert order items
  const orderItems = orderData.items.map((item: any) => ({
    id: `${orderData.orderId}-${item.id}`,
    order_id: orderData.orderId,
    png_data_url: item.pngDataUrl,
    nametag: item.nametag,
    has_charm: item.hasCharm,
    item_price: 49000 + (item.hasCharm ? 6000 : 0)
  }))

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  return order
}

export async function uploadPaymentProof(file: File, orderId: string) {
  const fileName = `payment-proofs/${orderId}-${Date.now()}.${file.name.split('.').pop()}`
  
  const { data, error } = await supabaseAdmin.storage
    .from('order-files')
    .upload(fileName, file)

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('order-files')
    .getPublicUrl(fileName)

  // Update order with payment proof URL
  await supabaseAdmin
    .from('orders')
    .update({ payment_proof_url: publicUrl })
    .eq('id', orderId)

  return publicUrl
}

export async function getOrder(orderId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .single()

  if (error) throw error
  return data
}

export async function getAllOrders() {
  if (!hasValidConfig) {
    throw new Error('Supabase not configured. Please set up environment variables in your hosting platform.')
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
