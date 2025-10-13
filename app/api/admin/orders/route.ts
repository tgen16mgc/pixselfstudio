import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin API: Fetching orders...')

    // This runs on the server side, so it can use the service key
    const orders = await getAllOrders()

    console.log('✅ Admin API: Orders fetched successfully:', orders?.length || 0, 'orders')

    return NextResponse.json({
      success: true,
      orders: orders || [],
      count: orders?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Admin API: Error fetching orders:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch orders',
      orders: [],
      count: 0
    }, { status: 500 })
  }
}
