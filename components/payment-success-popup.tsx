"use client"

import React from 'react'
import { CheckCircle, Package, Clock, ArrowRight, X } from 'lucide-react'
import { PIXSELF_BRAND } from '@/config/pixself-brand'
import { Press_Start_2P } from "next/font/google"

const press2p = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
})

interface PaymentSuccessPopupProps {
  isOpen: boolean
  onClose: () => void
  orderData?: {
    orderId: string
    customerName: string
    itemCount: number
    total: number
    estimatedDelivery: string
  }
}

export const PaymentSuccessPopup: React.FC<PaymentSuccessPopupProps> = ({
  isOpen,
  onClose,
  orderData
}) => {
  if (!isOpen) return null

  // Defensive fallback in case brand config is unavailable at runtime
  const colors = PIXSELF_BRAND?.colors ?? {
    primary: { gold: '#F4D03F', navy: '#2C3E50' },
    accent: { sparkle: '#FFD700', star: '#FFF700' },
    text: { primary: '#1F2937', secondary: '#4B5563', muted: '#6B7280' },
    ui: { success: '#27AE60', info: '#3498DB' },
    cloud: { white: '#FFFFFF' },
    sky: { light: '#B0E0E6' },
  } as any

  return (
    <>
      {/* Centered container without dark backdrop */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        {/* Popup Container */}
        <div 
          className="relative max-w-md w-full mx-auto pointer-events-auto"
        >
          {/* Main Popup */}
          <div 
            className="relative border-4 shadow-2xl transform transition-all duration-300 scale-100"
            style={{
              backgroundColor: colors.primary.gold,
              borderColor: colors.accent.sparkle,
              boxShadow: `0 0 30px ${colors.accent.sparkle}40, inset 0 0 20px ${colors.primary.gold}20`
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-2 rounded-lg transition-colors"
              style={{ color: colors.text?.primary || '#1F2937' }}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header Section */}
            <div className="text-center p-5 pb-3">
              {/* Success Icon */}
              <div className="mx-auto mb-3 relative">
                <div 
                  className="w-16 h-16 rounded-lg border-4 flex items-center justify-center mx-auto"
                  style={{
                    backgroundColor: (colors.ui?.success || '#27AE60') + '20',
                    borderColor: colors.ui?.success || '#27AE60'
                  }}
                >
                  <CheckCircle 
                    className="h-8 w-8" 
                    style={{ color: colors.ui?.success || '#27AE60' }}
                  />
                </div>
              </div>

              {/* Success Message */}
              <h2 
                className={`text-[16px] font-bold mb-1 ${press2p.className}`}
                style={{ color: colors.text?.primary || '#1F2937' }}
              >
                🎉 PAYMENT SUCCESS!
              </h2>
              <p 
                className={`text-[10px] mb-3 ${press2p.className}`}
                style={{ color: colors.text?.secondary || '#4B5563' }}
              >
                Your order has been confirmed!
              </p>
            </div>

            {/* Order Details */}
            {orderData && (
              <div className="px-5 pb-3">
                <div 
                  className="border-2 p-4 mb-4"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: colors.accent.star,
                    // Use FVF Fernando for all details below (labels and values)
                    fontFamily: 'FVF Fernando, monospace'
                  }}
                >
                  {/* Order ID */}
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className={"text-[10px]"}
                      style={{ color: colors.text?.secondary || '#4B5563' }}
                    >
                      ORDER ID:
                    </span>
                    <span 
                      className={"text-[10px] font-bold"}
                      style={{ color: colors.text?.primary || '#1F2937' }}
                    >
                      {orderData.orderId}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className={"text-[10px]"}
                      style={{ color: colors.text?.secondary || '#4B5563' }}
                    >
                      CUSTOMER:
                    </span>
                    <span 
                      className={"text-[10px] font-bold"}
                      style={{ color: colors.text?.primary || '#1F2937' }}
                    >
                      {orderData.customerName}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Package 
                        className="h-3 w-3" 
                        style={{ color: colors.accent.star }}
                      />
                      <span 
                        className={"text-[10px]"}
                        style={{ color: colors.text?.secondary || '#4B5563' }}
                      >
                        ITEMS:
                      </span>
                    </div>
                    <span 
                      className={"text-[10px] font-bold"}
                      style={{ color: colors.text?.primary || '#1F2937' }}
                    >
                      {orderData.itemCount} KEYCHAIN{orderData.itemCount > 1 ? 'S' : ''}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mb-3">
                    <span 
                      className={"text-[10px]"}
                      style={{ color: colors.text?.secondary || '#4B5563' }}
                    >
                      TOTAL:
                    </span>
                    <span 
                      className={"text-[12px] font-bold"}
                      style={{ color: colors.primary.gold }}
                    >
                      {orderData.total.toLocaleString('vi-VN')} VND
                    </span>
                  </div>

                  {/* Delivery Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock 
                        className="h-3 w-3" 
                        style={{ color: colors.ui?.info || '#3498DB' }}
                      />
                      <span 
                        className={"text-[10px]"}
                        style={{ color: colors.text?.secondary || '#4B5563' }}
                      >
                        DELIVERY:
                      </span>
                    </div>
                    <span 
                      className={"text-[10px] font-bold"}
                      style={{ color: colors.ui?.info || '#3498DB' }}
                    >
                      {orderData.estimatedDelivery}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-5 pb-5">
              <div className="space-y-3">
                {/* Continue Shopping Button */}
                <button
                  onClick={() => {
                    onClose()
                    // Flag is already set when order was completed
                    window.location.replace('/')
                  }}
                  className={`w-full py-3 px-4 border-4 font-bold text-[12px] transition-all duration-200 flex items-center justify-center gap-2 ${press2p.className}`}
                  style={{
                    backgroundColor: colors.accent.sparkle,
                    borderColor: colors.accent.star,
                    color: colors.text?.primary || '#1F2937',
                    boxShadow: `4px 4px 0px ${colors.accent.star}`
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                  CONTINUE SHOPPING
                </button>
              </div>

              {/* Thank You Message */}
              <div className="mt-4 text-center">
                <p 
                  className={`text-[10px] ${press2p.className}`}
                  style={{ color: colors.text?.secondary || '#4B5563' }}
                >
                  Thank you for choosing Pixself! 💖
                </p>
                <p 
                  className={`text-[8px] mt-1 ${press2p.className}`}
                  style={{ color: colors.text?.muted || '#6B7280' }}
                >
                  We'll start crafting your keychains right away!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
