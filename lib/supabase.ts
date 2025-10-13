// Supabase setup - now active!
import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks for debugging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Check if environment variables are available
const hasValidConfig = Boolean(supabaseUrl && supabaseAnonKey)
const hasServiceKey = Boolean(supabaseServiceKey)

if (!hasValidConfig) {
  console.warn('⚠️ Supabase not configured:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
    serviceKey: hasServiceKey ? 'PRESENT' : 'MISSING',
    isClient: typeof window !== 'undefined',
    environment: typeof window !== 'undefined' ? 'CLIENT' : 'SERVER'
  })
}

// Create a mock client if configuration is missing (for graceful degradation)
const createMockClient = () => {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        order: (column: string, options?: { ascending?: boolean }) => ({
          then: async (callback?: (result: any) => void) => {
            const result = { data: [], error: null }
            if (callback) callback(result)
            return result
          }
        }),
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        eq: (column: string, value: any) => ({
          then: async (callback?: (result: any) => void) => {
            const result = { data: [], error: null }
            if (callback) callback(result)
            return result
          }
        }),
        then: async (callback?: (result: any) => void) => {
          const result = { data: [], error: null }
          if (callback) callback(result)
          return result
        }
      }),
      insert: (data: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: async (callback?: (result: any) => void) => {
            const result = { data: null, error: { message: 'Supabase not configured' } }
            if (callback) callback(result)
            return result
          }
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (callback?: (result: any) => void) => {
            const result = { data: null, error: { message: 'Supabase not configured' } }
            if (callback) callback(result)
            return result
          }
        })
      })
    }),
    storage: {
      from: (bucket: string) => ({
        upload: (path: string, file: File) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: '' } })
      })
    }
  }
}

// Initialize Supabase client only if configuration is valid
export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any

// Admin client using service role key (for admin operations)
// Only create on server side to avoid exposing service key to client
export const supabaseAdminRead = (typeof window === 'undefined') && hasValidConfig && hasServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createMockClient() as any

// Server-side client for API routes
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
  configured: hasValidConfig,
  environment: process.env.NODE_ENV
})

// Database helper functions
export async function createOrder(orderData: any) {
  if (!hasValidConfig) {
    throw new Error('Supabase not configured. Please set up environment variables in your hosting platform.')
  }

  const insertResult = await supabaseAdmin
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

  if (insertResult.error) throw insertResult.error

  // Insert order items
  const orderItems = orderData.items.map((item: any) => ({
    id: `${orderData.orderId}-${item.id}`,
    order_id: orderData.orderId,
    png_data_url: item.pngDataUrl,
    nametag: item.nametag,
    has_charm: item.hasCharm,
    has_gift_box: item.hasGiftBox,
    has_extra_items: item.hasExtraItems,
    item_price: 49000 + (item.hasCharm ? 6000 : 0) + (item.hasGiftBox ? 40000 : 0) + (item.hasExtraItems ? 0 : 0)
  }))

  const itemsResult = await supabaseAdmin
    .from('order_items')
    .insert(orderItems)

  if (itemsResult.error) throw itemsResult.error

  return insertResult.data
}

export async function uploadPaymentProof(file: File, orderId: string) {
  if (!hasValidConfig) {
    throw new Error('Supabase not configured. Please set up environment variables in your hosting platform.')
  }

  const fileName = `payment-proofs/${orderId}-${Date.now()}.${file.name.split('.').pop()}`

  const uploadResult = await supabaseAdmin.storage
    .from('order-files')
    .upload(fileName, file)

  if (uploadResult.error) throw uploadResult.error

  // Get public URL
  const urlResult = await supabaseAdmin.storage
    .from('order-files')
    .getPublicUrl(fileName)

  const publicUrl = urlResult.data?.publicUrl || ''

  // Update order with payment proof URL
  const updateResult = await supabaseAdmin
    .from('orders')
    .update({ payment_proof_url: publicUrl })
    .eq('id', orderId)

  if (updateResult.error) throw updateResult.error

  return publicUrl
}

export async function getOrder(orderId: string) {
  if (!hasValidConfig) {
    throw new Error('Supabase not configured. Please set up environment variables in your hosting platform.')
  }

  const result = await supabaseAdminRead
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .single()

  if (result.error) throw result.error
  return result.data
}

export async function getAllOrders() {
  console.log('🔍 getAllOrders called, hasValidConfig:', hasValidConfig, 'hasServiceKey:', hasServiceKey, 'isClient:', typeof window !== 'undefined')

  if (!hasValidConfig) {
    console.error('❌ Supabase not configured')
    throw new Error('Supabase not configured. Please set up environment variables in your hosting platform.')
  }

  // Check if we can use the admin client (server-side only)
  if (typeof window === 'undefined' && hasServiceKey) {
    console.log('🔄 Fetching orders from Supabase (server-side with service key)...')
    const result = await supabaseAdminRead
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })

    if (result.error) {
      console.error('❌ Supabase query error:', result.error)
      throw result.error
    }

    console.log('✅ Orders fetched successfully:', result.data?.length || 0, 'orders')
    return result.data || []
  } else {
    // Client-side or no service key - return empty array for now
    console.log('⚠️ Using client-side fallback (no service key available)')
    return []
  }
}
