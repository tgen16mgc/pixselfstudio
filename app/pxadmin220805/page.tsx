"use client"

import React, { useState, useEffect } from 'react'
import { getAllOrders } from '@/lib/supabase'
import { PixselfBackground } from '@/components/pixself-background'
import { PIXSELF_BRAND } from '@/config/pixself-brand'
import { Package, User, Phone, Mail, MapPin, Home, Gift, Clock, CheckCircle, XCircle, Eye, Download } from 'lucide-react'
import { Press_Start_2P } from "next/font/google"

const press2p = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
})

interface OrderItem {
  id: string
  png_data_url: string
  nametag: string
  has_charm: boolean
  item_price: number
  created_at: string
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_social: string
  shipping_option: 'pickup' | 'delivery'
  shipping_address: any
  discount_code: string
  total_price: number
  payment_proof_url: string
  status: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      console.log('🔄 Starting to load orders...')
      setLoading(true)
      setError(null)

      const data = await getAllOrders()
      console.log('✅ Orders loaded successfully:', data?.length || 0, 'orders')
      setOrders(data || [])
    } catch (err: any) {
      console.error('❌ Error loading orders:', err)
      if (err.message?.includes('Missing NEXT_PUBLIC_SUPABASE')) {
        setError('Supabase is not configured. Please set up your environment variables in your hosting platform.')
      } else {
        setError(`Failed to load orders: ${err.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
      console.log('🔄 Finished loading orders')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing': return <Package className="h-4 w-4 text-blue-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  if (loading) {
    return (
      <main className="min-h-screen relative">
        <PixselfBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className={`text-gray-600 ${press2p.className}`}>Loading orders...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen relative">
        <PixselfBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className={`text-2xl font-bold text-red-600 mb-4 ${press2p.className}`}>Error</h1>
            <p className={`text-gray-600 mb-6 ${press2p.className}`}>{error}</p>
            <button
              onClick={loadOrders}
              className={`px-4 py-2 bg-blue-600 text-white rounded ${press2p.className}`}
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative">
      <PixselfBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 lg:py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: PIXSELF_BRAND.colors.sky.light }}
              >
                <Package
                  className="h-6 w-6"
                  style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                />
              </div>
              <h1
                className={`text-[16px] sm:text-[18px] lg:text-[20px] font-bold ${press2p.className}`}
                style={{
                  color: PIXSELF_BRAND.colors.primary.navy,
                  textShadow: `2px 2px 0px ${PIXSELF_BRAND.colors.primary.gold}40`
                }}
              >
                PIXSELF ADMIN - ORDER DATABASE
              </h1>
            </div>
            <p
              className={`text-[10px] font-medium tracking-wide opacity-90 ${press2p.className}`}
              style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
            >
              Customer Orders & Items Management
            </p>
          </div>
        </header>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 rounded-lg border-2" style={{
            backgroundColor: PIXSELF_BRAND.colors.sky.light + '20',
            borderColor: PIXSELF_BRAND.colors.primary.navyLight + '30'
          }}>
            <p className={`text-[20px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              {orders.length}
            </p>
            <p className={`text-[8px] font-medium ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
              TOTAL ORDERS
            </p>
          </div>
          <div className="text-center p-4 rounded-lg border-2" style={{
            backgroundColor: PIXSELF_BRAND.colors.ui.warning + '20',
            borderColor: PIXSELF_BRAND.colors.ui.warning + '30'
          }}>
            <p className={`text-[20px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.ui.warning }}>
              {orders.filter(o => o.status === 'pending').length}
            </p>
            <p className={`text-[8px] font-medium ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
              PENDING
            </p>
          </div>
          <div className="text-center p-4 rounded-lg border-2" style={{
            backgroundColor: PIXSELF_BRAND.colors.ui.info + '20',
            borderColor: PIXSELF_BRAND.colors.ui.info + '30'
          }}>
            <p className={`text-[20px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.ui.info }}>
              {orders.filter(o => o.status === 'processing').length}
            </p>
            <p className={`text-[8px] font-medium ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
              PROCESSING
            </p>
          </div>
          <div className="text-center p-4 rounded-lg border-2" style={{
            backgroundColor: PIXSELF_BRAND.colors.ui.success + '20',
            borderColor: PIXSELF_BRAND.colors.ui.success + '30'
          }}>
            <p className={`text-[20px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.ui.success }}>
              {orders.filter(o => o.status === 'completed').length}
            </p>
            <p className={`text-[8px] font-medium ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
              COMPLETED
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2" style={{ borderColor: PIXSELF_BRAND.colors.primary.navy }}>
          <div className="px-6 py-4 border-b-2" style={{ borderColor: PIXSELF_BRAND.colors.primary.navy, backgroundColor: PIXSELF_BRAND.colors.sky.light }}>
            <h2 className={`text-[14px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
              ORDERS TABLE
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight + '30' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className={`px-6 py-3 text-left text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    ORDER ID
                  </th>
                  <th className={`px-6 py-3 text-left text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    CUSTOMER
                  </th>
                  <th className={`px-6 py-3 text-left text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    ITEMS
                  </th>
                  <th className={`px-6 py-3 text-left text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    TOTAL
                  </th>
                  <th className={`px-6 py-3 text-left text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    STATUS
                  </th>
                  <th className={`px-6 py-3 text-left text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    DATE
                  </th>
                  <th className={`px-6 py-3 text-left text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y" style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight + '20' }}>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50">
                      <td className={`px-6 py-4 text-[8px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                        {order.id.substring(0, 12)}...
                      </td>
                      <td className={`px-6 py-4 text-[8px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                        <div>
                          <div className="font-semibold">{order.customer_name}</div>
                          <div className="text-gray-500">{order.customer_email}</div>
                          <div className="text-gray-500">{order.customer_phone}</div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-[8px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                        {order.order_items?.length || 0} item(s)
                      </td>
                      <td className={`px-6 py-4 text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.gold }}>
                        {order.total_price.toLocaleString('vi-VN')} VND
                      </td>
                      <td className={`px-6 py-4 text-[8px] ${press2p.className}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-2 py-1 rounded-full text-[7px] font-bold ${press2p.className}`}
                            style={{
                              color: order.status === 'pending' ? PIXSELF_BRAND.colors.ui.warning :
                                     order.status === 'processing' ? PIXSELF_BRAND.colors.ui.info :
                                     order.status === 'completed' ? PIXSELF_BRAND.colors.ui.success :
                                     PIXSELF_BRAND.colors.ui.error,
                              backgroundColor: order.status === 'pending' ? PIXSELF_BRAND.colors.ui.warning + '20' :
                                               order.status === 'processing' ? PIXSELF_BRAND.colors.ui.info + '20' :
                                               order.status === 'completed' ? PIXSELF_BRAND.colors.ui.success + '20' :
                                               PIXSELF_BRAND.colors.ui.error + '20'
                            }}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-[8px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 text-[8px] ${press2p.className}`}>
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className={`px-3 py-1 rounded text-[7px] font-bold ${press2p.className} transition-all`}
                          style={{
                            backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                            color: PIXSELF_BRAND.colors.primary.navy,
                            border: `2px solid ${PIXSELF_BRAND.colors.primary.navy}`
                          }}
                        >
                          <Eye className="h-3 w-3 inline mr-1" />
                          {expandedOrder === order.id ? 'HIDE' : 'VIEW'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Order Details */}
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* Customer Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className={`font-bold text-[10px] mb-2 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                  CUSTOMER DETAILS
                                </h4>
                                <div className="space-y-1 text-[8px]">
                                  <p><strong>Name:</strong> {order.customer_name}</p>
                                  <p><strong>Email:</strong> {order.customer_email}</p>
                                  <p><strong>Phone:</strong> {order.customer_phone}</p>
                                  {order.customer_social && <p><strong>Social:</strong> {order.customer_social}</p>}
                                </div>
                              </div>

                              <div>
                                <h4 className={`font-bold text-[10px] mb-2 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                  SHIPPING INFO
                                </h4>
                                <div className="space-y-1 text-[8px]">
                                  <p><strong>Method:</strong> {order.shipping_option === 'pickup' ? 'Pickup at NEU' : 'Home Delivery'}</p>
                                  {order.shipping_option === 'delivery' && order.shipping_address && (
                                    <p><strong>Address:</strong> {JSON.stringify(order.shipping_address)}</p>
                                  )}
                                  {order.discount_code && <p><strong>Discount:</strong> {order.discount_code}</p>}
                                </div>
                              </div>
                            </div>

                            {/* Order Items Table */}
                            <div>
                              <h4 className={`font-bold text-[10px] mb-3 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                ORDER ITEMS ({order.order_items?.length || 0})
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-[8px]">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className={`px-3 py-2 text-left ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                        ITEM
                                      </th>
                                      <th className={`px-3 py-2 text-left ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                        NAMETAG
                                      </th>
                                      <th className={`px-3 py-2 text-left ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                        CHARM
                                      </th>
                                      <th className={`px-3 py-2 text-left ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                        PRICE
                                      </th>
                                      <th className={`px-3 py-2 text-left ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                        PREVIEW
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.order_items?.map((item, index) => (
                                      <tr key={item.id} className="border-t" style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight + '20' }}>
                                        <td className={`px-3 py-2 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                          Keychain #{index + 1}
                                        </td>
                                        <td className={`px-3 py-2 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                          "{item.nametag}"
                                        </td>
                                        <td className={`px-3 py-2 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                          {item.has_charm ? 'Yes (+6,000 VND)' : 'No'}
                                        </td>
                                        <td className={`px-3 py-2 font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.gold }}>
                                          {item.item_price.toLocaleString('vi-VN')} VND
                                        </td>
                                        <td className={`px-3 py-2`}>
                                          <div className="w-8 h-8 border rounded overflow-hidden" style={{ borderColor: PIXSELF_BRAND.colors.primary.navy }}>
                                            {item.png_data_url ? (
                                              <img
                                                src={item.png_data_url}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                                style={{ imageRendering: 'pixelated' }}
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: PIXSELF_BRAND.colors.sky.light }}>
                                                <Gift className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Payment & Actions */}
                            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight + '20' }}>
                              <div className="text-[8px]">
                                <p className={`font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                                  TOTAL: {order.total_price.toLocaleString('vi-VN')} VND
                                </p>
                                <p className={press2p.className} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                                  Created: {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {order.payment_proof_url && (
                                  <a
                                    href={order.payment_proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-3 py-1 rounded text-[7px] font-bold ${press2p.className} flex items-center gap-1`}
                                    style={{
                                      backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
                                      color: PIXSELF_BRAND.colors.cloud.white,
                                      border: `2px solid ${PIXSELF_BRAND.colors.accent.sparkle}`
                                    }}
                                  >
                                    <Download className="h-3 w-3" />
                                    Payment Proof
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4" style={{ color: PIXSELF_BRAND.colors.ui.muted }} />
              <h3 className={`text-[14px] font-bold mb-2 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                No orders yet
              </h3>
              <p className={`text-[10px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                Orders will appear here when customers place them
              </p>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              console.log('🔘 Refresh button clicked')
              loadOrders()
            }}
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-[10px] font-bold ${press2p.className} transition-all ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
            }`}
            style={{
              backgroundColor: loading ? PIXSELF_BRAND.colors.ui.muted : PIXSELF_BRAND.colors.primary.gold,
              color: PIXSELF_BRAND.colors.primary.navy,
              border: `2px solid ${PIXSELF_BRAND.colors.primary.navy}`
            }}
          >
            {loading ? 'LOADING...' : 'REFRESH DATA'}
          </button>
        </div>
      </div>
    </main>
  )
}
