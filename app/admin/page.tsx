"use client"

import React, { useState, useEffect } from 'react'
import { getAllOrders } from '@/lib/supabase'
import { PixselfBackground } from '@/components/pixself-background'
import { PixselfPanel } from '@/components/pixself-ui-components'
import { PIXSELF_BRAND } from '@/config/pixself-brand'
import { Package, User, Phone, Mail, MapPin, Home, Gift, Clock, CheckCircle, XCircle } from 'lucide-react'
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

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      setOrders(data)
      setError(null)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Failed to load orders. Make sure Supabase is configured correctly.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" style={{ color: PIXSELF_BRAND.colors.ui.warning }} />
      case 'processing': return <Package className="h-4 w-4" style={{ color: PIXSELF_BRAND.colors.ui.info }} />
      case 'completed': return <CheckCircle className="h-4 w-4" style={{ color: PIXSELF_BRAND.colors.ui.success }} />
      case 'cancelled': return <XCircle className="h-4 w-4" style={{ color: PIXSELF_BRAND.colors.ui.error }} />
      default: return <Clock className="h-4 w-4" style={{ color: PIXSELF_BRAND.colors.ui.muted }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return PIXSELF_BRAND.colors.ui.warning
      case 'processing': return PIXSELF_BRAND.colors.ui.info
      case 'completed': return PIXSELF_BRAND.colors.ui.success
      case 'cancelled': return PIXSELF_BRAND.colors.ui.error
      default: return PIXSELF_BRAND.colors.ui.muted
    }
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
                PIXSELF ADMIN
              </h1>
            </div>
            <p 
              className={`text-[10px] font-medium tracking-wide opacity-90 ${press2p.className}`}
              style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
            >
              Order Management Dashboard
            </p>
          </div>
        </header>

        {/* Stats Summary */}
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

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4" style={{ color: PIXSELF_BRAND.colors.ui.muted }} />
              <h3 className={`text-[14px] font-bold mb-2 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                No orders yet
              </h3>
              <p className={`text-[10px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                Orders will appear here when customers place them
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <PixselfPanel 
                key={order.id} 
                title={`ORDER ${order.id}`} 
                icon={getStatusIcon(order.status)}
              >
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h4 className={`font-bold text-[10px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                      CUSTOMER INFO
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }} />
                        <span className={`text-[8px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                          {order.customer_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }} />
                        <span className={`text-[8px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                          {order.customer_email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }} />
                        <span className={`text-[8px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                          {order.customer_phone}
                        </span>
                      </div>
                      {order.customer_social && (
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 text-center text-[6px]" style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>@</span>
                          <span className={`text-[8px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                            {order.customer_social}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Shipping Info */}
                    <div className="pt-4 border-t" style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight + '20' }}>
                      <div className="flex items-center gap-2 mb-2">
                        {order.shipping_option === 'pickup' ? 
                          <MapPin className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.primary.gold }} /> :
                          <Home className="h-3 w-3" style={{ color: PIXSELF_BRAND.colors.accent.sparkle }} />
                        }
                        <span className={`text-[8px] font-bold ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                          {order.shipping_option === 'pickup' ? 'PICKUP AT NEU' : 'HOME DELIVERY'}
                        </span>
                      </div>
                      {order.shipping_option === 'delivery' && order.shipping_address && (
                        <p className={`text-[7px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                          {JSON.stringify(order.shipping_address)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    <h4 className={`font-bold text-[10px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                      ITEMS ({order.order_items?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {order.order_items?.map((item, index) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border" style={{
                          backgroundColor: PIXSELF_BRAND.colors.sky.light + '20',
                          borderColor: PIXSELF_BRAND.colors.primary.navyLight + '20'
                        }}>
                          <div 
                            className="w-12 h-12 rounded border-2 overflow-hidden flex-shrink-0"
                            style={{ borderColor: PIXSELF_BRAND.colors.primary.navy }}
                          >
                            {item.png_data_url ? (
                              <img 
                                src={item.png_data_url} 
                                alt="Keychain" 
                                className="w-full h-full object-contain"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: PIXSELF_BRAND.colors.sky.light }}>
                                <Gift className="h-4 w-4" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-[8px] mb-1 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                              KEYCHAIN #{index + 1}
                            </p>
                            <p className={`text-[7px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                              "{item.nametag}"
                            </p>
                            {item.has_charm && (
                              <p className={`text-[7px] flex items-center gap-1 mt-1 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.gold }}>
                                <Gift className="h-2 w-2" />
                                + Sac Viet Charm
                              </p>
                            )}
                            <p className={`text-[8px] font-bold mt-1 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.gold }}>
                              {item.item_price.toLocaleString('vi-VN')} VND
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Status & Actions */}
                  <div className="space-y-4">
                    <h4 className={`font-bold text-[10px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                      ORDER STATUS
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span 
                          className={`text-[8px] font-bold px-2 py-1 rounded ${press2p.className}`}
                          style={{ 
                            color: getStatusColor(order.status),
                            backgroundColor: getStatusColor(order.status) + '20'
                          }}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[7px] space-y-1">
                        <p className={press2p.className} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                          Created: {new Date(order.created_at).toLocaleString()}
                        </p>
                        <p className={press2p.className} style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}>
                          Updated: {new Date(order.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="pt-3 border-t" style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight + '20' }}>
                        <p className={`font-bold text-[10px] mb-1 ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                          TOTAL: {order.total_price.toLocaleString('vi-VN')} VND
                        </p>
                        {order.payment_proof_url && (
                          <a 
                            href={order.payment_proof_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`text-[7px] text-blue-600 hover:underline ${press2p.className}`}
                          >
                            View Payment Proof
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </PixselfPanel>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
