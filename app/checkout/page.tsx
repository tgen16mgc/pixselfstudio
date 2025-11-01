"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { PixselfBackground } from '@/components/pixself-background'
import { PixselfButton, PixselfPanel } from '@/components/pixself-ui-components'
import { PIXSELF_BRAND } from '@/config/pixself-brand'
import { ArrowLeft, Upload, MapPin, Home, Gift, CreditCard, User, Truck, ShoppingBag } from 'lucide-react'
import { Press_Start_2P } from "next/font/google"
import { PaymentSuccessPopup } from '@/components/payment-success-popup'

const press2p = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
})

interface CheckoutFormData {
  // Personal Info
  fullName: string
  phone: string
  email: string
  socialMedia: string
  
  // Shipping
  shippingOption: 'pickup' | 'delivery'
  address: {
    street: string
    district: string
    city: string
  }
  
  // Payment
  discountCode: string
  paymentProof: File | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart, updateCharm } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)
  const [discountState, setDiscountState] = useState({
    code: '',
    isApplied: false,
    isValidating: false,
    discountAmount: 0,
    discountData: null as any,
    isGiftCode: false,
    error: ''
  })
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    socialMedia: '',
    shippingOption: 'pickup',
    address: {
      street: '',
      district: '',
      city: ''
    },
    discountCode: '',
    paymentProof: null
  })

  // Check cart and handle redirect with delay
  useEffect(() => {
    // Give cart context time to initialize
    const timer = setTimeout(() => {
      setIsInitializing(false)
      // If the success popup is showing, do NOT redirect even if cart is empty
      if (!showSuccessPopup && items.length === 0) {
        // Check if we're coming from a successful order (no alert needed)
        const isFromSuccessfulOrder = sessionStorage.getItem('pixself-order-completed')
        console.log('🔍 Checkout redirect check:', { 
          showSuccessPopup, 
          itemsLength: items.length, 
          isFromSuccessfulOrder,
          sessionStorage: sessionStorage.getItem('pixself-order-completed')
        })
        
        if (isFromSuccessfulOrder) {
          // Clear the flag and redirect silently
          sessionStorage.removeItem('pixself-order-completed')
          console.log('✅ Redirecting silently after successful order')
          router.push('/')
          return
        }
        // Only show alert if we're not coming from a successful order
        console.log('⚠️ Showing cart empty alert')
        alert('Your cart is empty. Please add items to cart before checkout.')
        router.push('/')
      }
    }, 1000) // 1 second delay to allow cart to load

    return () => clearTimeout(timer)
  }, [items, router, showSuccessPopup])

  const shippingFee = formData.shippingOption === 'delivery' ? 20000 : 0
  const subtotal = totalPrice
  const discountAmount = discountState.discountAmount
  const finalTotal = subtotal + shippingFee - discountAmount

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountState.code.trim()) return

    setDiscountState(prev => ({ ...prev, isValidating: true, error: '' }))

    try {
      const response = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: discountState.code,
          items: items.map(item => ({
            id: item.id,
            nametag: item.nametag,
            hasCharm: item.hasCharm,
            hasGiftBox: item.hasGiftBox,
            hasExtraItems: item.hasExtraItems,
            price: 49000 + (item.hasCharm ? 6000 : 0) + (item.hasGiftBox ? 40000 : 0)
          })),
          subtotal: totalPrice
        })
      })

      const result = await response.json()

      if (result.valid) {
        const isGiftCode = result.isGiftCode || result.discountType === 'gift'
        
        // Enforce mutual exclusivity: 
        // - If currently have a gift code and applying a discount, remove charms
        // - If currently have a discount and applying a gift code, it's already cleared
        if (discountState.isGiftCode && !isGiftCode) {
          // Removing gift code, clear charms
          items.forEach(item => {
            updateCharm(item.id, false)
          })
        }
        
        // If it's a gift code, auto-add Loopy Charm to all items
        if (isGiftCode) {
          items.forEach(item => {
            updateCharm(item.id, true)
          })
        }

        setDiscountState(prev => ({
          ...prev,
          isApplied: true,
          isValidating: false,
          discountAmount: result.discountAmount || 0,
          discountData: result,
          isGiftCode,
          error: ''
        }))
      } else {
        setDiscountState(prev => ({
          ...prev,
          isApplied: false,
          isValidating: false,
          discountAmount: 0,
          discountData: null,
          isGiftCode: false,
          error: result.message || 'Invalid discount code'
        }))
      }
    } catch (error) {
      console.error('Discount validation error:', error)
      setDiscountState(prev => ({
        ...prev,
        isApplied: false,
        isValidating: false,
        discountAmount: 0,
        discountData: null,
        isGiftCode: false,
        error: 'Failed to validate discount code'
      }))
    }
  }

  const handleRemoveDiscount = () => {
    // If removing a gift code, also remove charms from all items
    if (discountState.isGiftCode) {
      items.forEach(item => {
        updateCharm(item.id, false)
      })
    }
    
    setDiscountState({
      code: '',
      isApplied: false,
      isValidating: false,
      discountAmount: 0,
      discountData: null,
      isGiftCode: false,
      error: ''
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      paymentProof: file
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.fullName || !formData.phone || !formData.email) {
        alert('Please fill in all required personal information fields')
        return
      }

      if (formData.shippingOption === 'delivery' && (!formData.address.street || !formData.address.district || !formData.address.city)) {
        alert('Please fill in your complete address for home delivery')
        return
      }

      if (!formData.paymentProof) {
        alert('Please upload your payment proof')
        return
      }

      // Submit to backend API
      const orderFormData = new FormData()
      orderFormData.append('orderData', JSON.stringify({
        items,
        formData: {
          ...formData,
          discountCode: discountState.isApplied ? discountState.code : formData.discountCode
        },
        totalPrice: finalTotal,
        discountAmount: discountState.discountAmount,
        discountData: discountState.discountData
      }))
      
      if (formData.paymentProof) {
        orderFormData.append('paymentProof', formData.paymentProof)
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: orderFormData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit order')
      }

      // Success - show custom popup instead of alert
      // Set flag immediately when order is successful
      sessionStorage.setItem('pixself-order-completed', 'true')
      
      setOrderResult({
        orderId: result.orderId,
        customerName: formData.fullName,
        itemCount: items.length,
        total: finalTotal,
        estimatedDelivery: result.estimatedDelivery,
        message: result.message
      })
      setShowSuccessPopup(true)
      clearCart()

    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Error submitting order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while initializing
  if (isInitializing) {
    return (
      <main className="min-h-screen relative">
        <PixselfBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center flex flex-col items-center justify-center">
            {/* Pixself-style loading spinner */}
            <div className="relative mb-6">
              <div 
                className="w-16 h-16 border-4 animate-spin rounded-full"
                style={{
                  borderColor: PIXSELF_BRAND.colors.primary.navy,
                  borderTopColor: PIXSELF_BRAND.colors.primary.gold,
                  boxShadow: PIXSELF_BRAND.shadows.pixelLarge,
                  imageRendering: "pixelated"
                }}
              />
              {/* 8-bit sparkle effects */}
              <div className="absolute inset-0 animate-pulse">
                <div 
                  className="absolute w-2 h-2 animate-bounce"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.accent.sparkle,
                    top: '10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    animationDelay: '0s',
                    boxShadow: `0 0 4px ${PIXSELF_BRAND.colors.accent.sparkle}`
                  }}
                />
                <div 
                  className="absolute w-2 h-2 animate-bounce"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.accent.star,
                    top: '20%',
                    right: '10%',
                    animationDelay: '0.3s',
                    boxShadow: `0 0 4px ${PIXSELF_BRAND.colors.accent.star}`
                  }}
                />
                <div 
                  className="absolute w-2 h-2 animate-bounce"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                    bottom: '20%',
                    left: '15%',
                    animationDelay: '0.6s',
                    boxShadow: `0 0 4px ${PIXSELF_BRAND.colors.primary.gold}`
                  }}
                />
              </div>
            </div>
            
            {/* Loading text with Pixself styling */}
            <div 
              className={`text-[12px] font-bold tracking-wider px-4 py-2 border-4 ${press2p.className}`}
              style={{
                color: PIXSELF_BRAND.colors.primary.navy,
                backgroundColor: PIXSELF_BRAND.colors.cloud.white,
                borderColor: PIXSELF_BRAND.colors.primary.gold,
                boxShadow: PIXSELF_BRAND.shadows.pixel,
                textShadow: `2px 2px 0px ${PIXSELF_BRAND.colors.primary.gold}`,
                imageRendering: "pixelated"
              }}
            >
              LOADING CHECKOUT...
            </div>
            
            {/* 8-bit loading dots */}
            <div className="flex justify-center space-x-2 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 animate-bounce border"
                  style={{
                    backgroundColor: PIXSELF_BRAND.colors.primary.gold,
                    borderColor: PIXSELF_BRAND.colors.primary.navy,
                    animationDelay: `${i * 0.2}s`,
                    boxShadow: `1px 1px 0px ${PIXSELF_BRAND.colors.primary.navy}`,
                    imageRendering: "pixelated"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Show empty cart message if no items (before redirect)
  // If success popup is open, suppress the empty cart screen so the popup can show
  if (items.length === 0 && !showSuccessPopup) {
    return (
      <main className="min-h-screen relative">
        <PixselfBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Please add items to your cart before checkout.</p>
            <PixselfButton
              onClick={() => router.push('/')}
              variant="accent"
            >
              Go Shopping
            </PixselfButton>
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
          <div className="flex items-center justify-between mb-6">
            <PixselfButton
              onClick={() => router.back()}
              variant="secondary"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              BACK
            </PixselfButton>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold }}></div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIXSELF_BRAND.colors.accent.sparkle }}></div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold }}></div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: PIXSELF_BRAND.colors.sky.light }}
              >
                <ShoppingBag 
                  className="h-6 w-6" 
                  style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                />
              </div>
              <h1 
                className={`text-[14px] sm:text-[16px] lg:text-[18px] font-bold ${press2p.className}`}
                style={{ 
                  color: PIXSELF_BRAND.colors.primary.navy,
                  textShadow: `2px 2px 0px ${PIXSELF_BRAND.colors.primary.gold}40`
                }}
              >
                CHECKOUT
              </h1>
            </div>
            <p 
              className={`text-[10px] font-medium tracking-wide opacity-90 ${press2p.className}`}
              style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
            >
              Complete your Pixself Keychain order
            </p>
          </div>
        </header>

        {/* Two Column Layout: Form Left, Summary Right */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Information */}
              <PixselfPanel title="PERSONAL INFORMATION" icon={<User className="h-4 w-4" />}>
                <div className="space-y-5">
                  <div>
                    <label 
                      className={`block text-[10px] font-bold mb-2 tracking-wider ${press2p.className}`}
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full border-2 rounded-lg focus:outline-none font-medium transition-all fernando-placeholder ${press2p.className}`}
                      style={{
                        borderColor: PIXSELF_BRAND.colors.primary.navyLight + '40',
                        backgroundColor: PIXSELF_BRAND.colors.sky.light + '20'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = PIXSELF_BRAND.colors.primary.gold
                        e.target.style.boxShadow = `0 0 0 3px ${PIXSELF_BRAND.colors.primary.gold}20`
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = PIXSELF_BRAND.colors.primary.navyLight + '40'
                        e.target.style.boxShadow = 'none'
                      }}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      className={`block text-[10px] font-bold mb-2 tracking-wider ${press2p.className}`}
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      PHONE NUMBER *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full border-2 rounded-lg focus:outline-none font-medium transition-all fernando-placeholder ${press2p.className}`}
                      style={{
                        borderColor: PIXSELF_BRAND.colors.primary.navyLight + '40',
                        backgroundColor: PIXSELF_BRAND.colors.sky.light + '20'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = PIXSELF_BRAND.colors.primary.gold
                        e.target.style.boxShadow = `0 0 0 3px ${PIXSELF_BRAND.colors.primary.gold}20`
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = PIXSELF_BRAND.colors.primary.navyLight + '40'
                        e.target.style.boxShadow = 'none'
                      }}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      className={`block text-[10px] font-bold mb-2 tracking-wider ${press2p.className}`}
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full border-2 rounded-lg focus:outline-none font-medium transition-all fernando-placeholder ${press2p.className}`}
                      style={{
                        borderColor: PIXSELF_BRAND.colors.primary.navyLight + '40',
                        backgroundColor: PIXSELF_BRAND.colors.sky.light + '20'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = PIXSELF_BRAND.colors.primary.gold
                        e.target.style.boxShadow = `0 0 0 3px ${PIXSELF_BRAND.colors.primary.gold}20`
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = PIXSELF_BRAND.colors.primary.navyLight + '40'
                        e.target.style.boxShadow = 'none'
                      }}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      className={`block text-[10px] font-bold mb-2 tracking-wider ${press2p.className}`}
                      style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                    >
                      FACEBOOK/INSTAGRAM (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia}
                      onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                      className={`w-full border-2 rounded-lg focus:outline-none font-medium transition-all fernando-placeholder ${press2p.className}`}
                      style={{
                        borderColor: PIXSELF_BRAND.colors.primary.navyLight + '30',
                        backgroundColor: PIXSELF_BRAND.colors.sky.light + '15'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = PIXSELF_BRAND.colors.accent.sparkle
                        e.target.style.boxShadow = `0 0 0 3px ${PIXSELF_BRAND.colors.accent.sparkle}20`
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = PIXSELF_BRAND.colors.primary.navyLight + '30'
                        e.target.style.boxShadow = 'none'
                      }}
                      placeholder="@username or profile link"
                    />
                  </div>
                </div>
              </PixselfPanel>

              {/* Shipping Options */}
              <PixselfPanel title="SHIPPING OPTIONS" icon={<Truck className="h-4 w-4" />}>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <label 
                      className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: formData.shippingOption === 'pickup' 
                          ? PIXSELF_BRAND.colors.primary.gold 
                          : PIXSELF_BRAND.colors.primary.navyLight + '30',
                        backgroundColor: formData.shippingOption === 'pickup'
                          ? PIXSELF_BRAND.colors.primary.gold + '10'
                          : PIXSELF_BRAND.colors.sky.light + '20'
                      }}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value="pickup"
                        checked={formData.shippingOption === 'pickup'}
                        onChange={(e) => handleInputChange('shippingOption', e.target.value)}
                        className="w-5 h-5"
                        style={{ accentColor: PIXSELF_BRAND.colors.primary.gold }}
                      />
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: PIXSELF_BRAND.colors.primary.gold + '20' }}
                      >
                        <MapPin 
                          className="h-5 w-5" 
                          style={{ color: PIXSELF_BRAND.colors.primary.gold }} 
                        />
                      </div>
                      <div className="flex-1">
                        <div 
                          className={`font-bold text-[11px] tracking-wider ${press2p.className}`}
                          style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                        >
                          PICKUP AT NEU
                        </div>
                        <div 
                          className={`text-[9px] font-medium ${press2p.className}`}
                          style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                        >
                          Free - Pick up at National Economics University
                        </div>
                      </div>
                      <div 
                        className={`text-[10px] font-bold px-3 py-1 rounded-full ${press2p.className}`}
                        style={{ 
                          color: PIXSELF_BRAND.colors.primary.gold,
                          backgroundColor: PIXSELF_BRAND.colors.primary.gold + '20'
                        }}
                      >
                        FREE
                      </div>
                    </label>
                    
                    <label 
                      className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: formData.shippingOption === 'delivery' 
                          ? PIXSELF_BRAND.colors.accent.sparkle 
                          : PIXSELF_BRAND.colors.primary.navyLight + '30',
                        backgroundColor: formData.shippingOption === 'delivery'
                          ? PIXSELF_BRAND.colors.accent.sparkle + '10'
                          : PIXSELF_BRAND.colors.sky.light + '20'
                      }}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value="delivery"
                        checked={formData.shippingOption === 'delivery'}
                        onChange={(e) => handleInputChange('shippingOption', e.target.value)}
                        className="w-5 h-5"
                        style={{ accentColor: PIXSELF_BRAND.colors.accent.sparkle }}
                      />
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: PIXSELF_BRAND.colors.accent.sparkle + '20' }}
                      >
                        <Home 
                          className="h-5 w-5" 
                          style={{ color: PIXSELF_BRAND.colors.accent.sparkle }} 
                        />
                      </div>
                      <div className="flex-1">
                        <div 
                          className={`font-bold text-[11px] tracking-wider ${press2p.className}`}
                          style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                        >
                          HOME DELIVERY
                        </div>
                        <div 
                          className={`text-[9px] font-medium ${press2p.className}`}
                          style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                        >
                          Delivery to your address
                        </div>
                      </div>
                      <div 
                        className={`text-[10px] font-bold px-3 py-1 rounded-full ${press2p.className}`}
                        style={{ 
                          color: PIXSELF_BRAND.colors.accent.sparkle,
                          backgroundColor: PIXSELF_BRAND.colors.accent.sparkle + '20'
                        }}
                      >
                        +20,000 VND
                      </div>
                    </label>
                  </div>
                  
                  {/* Address fields (show only if delivery is selected) */}
                  {formData.shippingOption === 'delivery' && (
                    <div 
                      className="space-y-3 mt-4 p-4 rounded-lg"
                      style={{ backgroundColor: PIXSELF_BRAND.colors.accent.sparkle + '10' }}
                    >
                      <h4 className={`font-semibold text-[11px] ${press2p.className}`} style={{ color: PIXSELF_BRAND.colors.primary.navy }}>DELIVERY ADDRESS</h4>
                      <div>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => handleInputChange('address.street', e.target.value)}
                          className={`w-full border-2 rounded-lg focus:outline-none font-medium transition-all fernando-placeholder ${press2p.className}`}
                          style={{
                            borderColor: PIXSELF_BRAND.colors.primary.navyLight + '40',
                            backgroundColor: PIXSELF_BRAND.colors.sky.light + '20'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = PIXSELF_BRAND.colors.accent.sparkle
                            e.target.style.boxShadow = `0 0 0 3px ${PIXSELF_BRAND.colors.accent.sparkle}20`
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = PIXSELF_BRAND.colors.primary.navyLight + '40'
                            e.target.style.boxShadow = 'none'
                          }}
                          placeholder="Street address"
                          required={formData.shippingOption === 'delivery'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={formData.address.district}
                          onChange={(e) => handleInputChange('address.district', e.target.value)}
                          className={`w-full border-2 rounded-lg focus:outline-none font-medium transition-all fernando-placeholder ${press2p.className}`}
                          style={{
                            borderColor: PIXSELF_BRAND.colors.primary.navyLight + '40',
                            backgroundColor: PIXSELF_BRAND.colors.sky.light + '20'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = PIXSELF_BRAND.colors.accent.sparkle
                            e.target.style.boxShadow = `0 0 0 3px ${PIXSELF_BRAND.colors.accent.sparkle}20`
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = PIXSELF_BRAND.colors.primary.navyLight + '40'
                            e.target.style.boxShadow = 'none'
                          }}
                          placeholder="District"
                          required={formData.shippingOption === 'delivery'}
                        />
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange('address.city', e.target.value)}
                          className={`w-full border-2 rounded-lg focus:outline-none font-medium transition-all fernando-placeholder ${press2p.className}`}
                          style={{
                            borderColor: PIXSELF_BRAND.colors.primary.navyLight + '40',
                            backgroundColor: PIXSELF_BRAND.colors.sky.light + '20'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = PIXSELF_BRAND.colors.accent.sparkle
                            e.target.style.boxShadow = `0 0 0 3px ${PIXSELF_BRAND.colors.accent.sparkle}20`
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = PIXSELF_BRAND.colors.primary.navyLight + '40'
                            e.target.style.boxShadow = 'none'
                          }}
                          placeholder="City"
                          required={formData.shippingOption === 'delivery'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </PixselfPanel>

              {/* Payment Section */}
              <PixselfPanel title="PAYMENT" icon={<CreditCard className="h-4 w-4" />}>
                <div className="space-y-6">
                  {/* QR Code Payment */}
                  <div className="text-center">
                    <h4 
                      className={`font-bold text-[11px] mb-4 tracking-wider ${press2p.className}`}
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      SCAN QR CODE TO PAY
                    </h4>
                    <div 
                      className="inline-block p-4 rounded-lg shadow-lg border-2"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: PIXSELF_BRAND.colors.primary.gold
                      }}
                    >
                      <img 
                        src="/image/qr-payment.jpg" 
                        alt="Payment QR Code" 
                        className="w-48 h-auto mx-auto rounded-lg"
                        style={{ imageRendering: 'auto' }}
                      />
                    </div>
                    <p 
                      className={`text-[11px] font-semibold mt-4 p-2 rounded-lg tracking-wide ${press2p.className}`}
                      style={{ 
                        color: PIXSELF_BRAND.colors.primary.gold,
                        backgroundColor: PIXSELF_BRAND.colors.primary.gold + '10'
                      }}
                    >
                      Amount to pay: <span className={press2p.className}>{finalTotal.toLocaleString('vi-VN')} VND</span>
                    </p>
                    <p 
                      className={`text-[8px] mt-2 font-medium ${press2p.className}`}
                      style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                    >
                      💳 Scan the QR code with your banking app to pay
                    </p>
                  </div>
                  
                  {/* Bill Upload */}
                  <div>
                    <label 
                      className={`block text-[10px] font-bold mb-2 tracking-wider ${press2p.className}`}
                      style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                    >
                      UPLOAD PAYMENT PROOF *
                    </label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:scale-[1.02]"
                      style={{ 
                        borderColor: formData.paymentProof 
                          ? PIXSELF_BRAND.colors.primary.gold 
                          : PIXSELF_BRAND.colors.primary.navyLight + '40',
                        backgroundColor: formData.paymentProof
                          ? PIXSELF_BRAND.colors.primary.gold + '10'
                          : PIXSELF_BRAND.colors.sky.light + '20'
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="payment-proof"
                        required
                      />
                      <label htmlFor="payment-proof" className="cursor-pointer">
                        <div 
                          className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: PIXSELF_BRAND.colors.accent.sparkle + '20' }}
                        >
                          <Upload 
                            className="h-6 w-6" 
                            style={{ color: PIXSELF_BRAND.colors.accent.sparkle }} 
                          />
                        </div>
                        <p 
                          className={`text-[10px] font-semibold mb-1 ${press2p.className}`}
                          style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                        >
                          {formData.paymentProof ? formData.paymentProof.name : 'Click to upload payment screenshot'}
                        </p>
                        <p 
                          className={`text-[8px] font-medium ${press2p.className}`}
                          style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                        >
                          PNG, JPG up to 10MB
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </PixselfPanel>
            </form>
          </div>

          {/* Right: Order Summary (1/3 width, Sticky) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6">
              <PixselfPanel title="ORDER SUMMARY" icon={<Gift className="h-4 w-4" />}>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-4 p-4 rounded-lg border-2"
                      style={{ 
                        borderColor: PIXSELF_BRAND.colors.primary.navyLight + '20',
                        backgroundColor: PIXSELF_BRAND.colors.sky.light + '30'
                      }}
                    >
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2"
                        style={{ 
                          borderColor: PIXSELF_BRAND.colors.primary.navy,
                          imageRendering: 'pixelated'
                        }}
                      >
                        {item.pngDataUrl ? (
                          <img 
                            src={item.pngDataUrl} 
                            alt="Keychain Preview" 
                            className="w-full h-full object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: PIXSELF_BRAND.colors.sky.light }}
                          >
                            <Gift className="h-6 w-6" style={{ color: PIXSELF_BRAND.colors.primary.navy }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 
                          className={`font-bold text-[10px] mb-2 ${press2p.className}`}
                          style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                        >
                          PIXSELF KEYCHAIN #{index + 1}
                        </h3>
                        <div className="space-y-1">
                          <p 
                            className={`text-[8px] font-semibold ${press2p.className}`}
                            style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                          >
                            Nametag: "{item.nametag}"
                          </p>
                          {item.hasCharm && (
                            <p 
                              className={`text-[8px] font-semibold flex items-center gap-1 ${press2p.className}`}
                              style={{ color: PIXSELF_BRAND.colors.primary.gold }}
                            >
                              <Gift className="h-3 w-3" />
                              + Sac Viet Charm
                            </p>
                          )}
                          <p 
                            className={`text-[9px] font-bold mt-2 ${press2p.className}`}
                            style={{ color: PIXSELF_BRAND.colors.primary.gold }}
                          >
                            {(49000 + (item.hasCharm ? 6000 : 0)).toLocaleString('vi-VN')} VND
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Discount Code */}
                  <div className="space-y-2">
                    <label 
                      className={`block text-[9px] font-bold mb-1 tracking-wider ${press2p.className}`}
                      style={{ color: PIXSELF_BRAND.colors.primary.navyLight }}
                    >
                      DISCOUNT / GIFT CODE (OPTIONAL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountState.code}
                        onChange={(e) => setDiscountState(prev => ({ ...prev, code: e.target.value.toUpperCase(), error: '' }))}
                        disabled={discountState.isApplied}
                        className={`flex-1 border-2 rounded-lg focus:outline-none font-medium transition-all fernando-placeholder ${press2p.className}`}
                        style={{
                          borderColor: discountState.error 
                            ? PIXSELF_BRAND.colors.ui.error 
                            : discountState.isApplied 
                              ? PIXSELF_BRAND.colors.ui.success 
                              : PIXSELF_BRAND.colors.primary.navyLight + '30',
                          backgroundColor: PIXSELF_BRAND.colors.sky.light + '15'
                        }}
                        onFocus={(e) => {
                          if (!discountState.isApplied) {
                            e.target.style.borderColor = PIXSELF_BRAND.colors.accent.sparkle
                            e.target.style.boxShadow = `0 0 0 3px ${PIXSELF_BRAND.colors.accent.sparkle}20`
                          }
                        }}
                        onBlur={(e) => {
                          if (!discountState.isApplied) {
                            e.target.style.borderColor = discountState.error 
                              ? PIXSELF_BRAND.colors.ui.error 
                              : PIXSELF_BRAND.colors.primary.navyLight + '30'
                            e.target.style.boxShadow = 'none'
                          }
                        }}
                        placeholder="Enter discount code"
                      />
                      {!discountState.isApplied ? (
                        <button
                          onClick={handleApplyDiscount}
                          disabled={!discountState.code.trim() || discountState.isValidating}
                          className={`px-4 py-3 border-2 rounded-lg font-bold text-[8px] transition-all ${press2p.className}`}
                          style={{
                            backgroundColor: (!discountState.code.trim() || discountState.isValidating) 
                              ? PIXSELF_BRAND.colors.primary.navyLight + '30'
                              : PIXSELF_BRAND.colors.primary.gold,
                            borderColor: PIXSELF_BRAND.colors.primary.navy,
                            color: PIXSELF_BRAND.colors.primary.navy,
                            cursor: (!discountState.code.trim() || discountState.isValidating) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {discountState.isValidating ? 'CHECKING...' : 'APPLY'}
                        </button>
                      ) : (
                        <button
                          onClick={handleRemoveDiscount}
                          className={`px-4 py-3 border-2 rounded-lg font-bold text-[8px] transition-all ${press2p.className}`}
                          style={{
                            backgroundColor: PIXSELF_BRAND.colors.ui.error,
                            borderColor: PIXSELF_BRAND.colors.primary.navy,
                            color: PIXSELF_BRAND.colors.cloud.white
                          }}
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                    {discountState.error && (
                      <p 
                        className={`text-[8px] font-medium ${press2p.className}`}
                        style={{ color: PIXSELF_BRAND.colors.ui.error }}
                      >
                        ❌ {discountState.error}
                      </p>
                    )}
                    {discountState.isApplied && (
                      <p 
                        className={`text-[8px] font-medium ${press2p.className}`}
                        style={{ color: PIXSELF_BRAND.colors.ui.success }}
                      >
                        {discountState.isGiftCode ? (
                          <>✅ {discountState.code} applied: Free Loopy Charm for all items</>
                        ) : (
                          <>✅ {discountState.code} applied: -{discountState.discountAmount.toLocaleString('vi-VN')} VND</>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div 
                    className="border-t-2 pt-4 space-y-3"
                    style={{ borderColor: PIXSELF_BRAND.colors.primary.navyLight + '30' }}
                  >
                    <div className={`flex justify-between text-[9px] font-semibold ${press2p.className}`}>
                      <span style={{ color: PIXSELF_BRAND.colors.primary.navy }}>Subtotal:</span>
                      <span style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                        {subtotal.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                    {discountState.isApplied && !discountState.isGiftCode && (
                      <div className={`flex justify-between text-[9px] font-semibold ${press2p.className}`}>
                        <span style={{ color: PIXSELF_BRAND.colors.ui.success }}>
                          Discount ({discountState.code}):
                        </span>
                        <span style={{ color: PIXSELF_BRAND.colors.ui.success }}>
                          -{discountState.discountAmount.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    )}
                    {discountState.isApplied && discountState.isGiftCode && (
                      <div className={`flex justify-between text-[9px] font-semibold ${press2p.className}`}>
                        <span style={{ color: PIXSELF_BRAND.colors.ui.success }}>
                          Gift ({discountState.code}):
                        </span>
                        <span style={{ color: PIXSELF_BRAND.colors.ui.success }}>
                          Free Loopy Charm
                        </span>
                      </div>
                    )}
                    <div className={`flex justify-between text-[9px] font-semibold ${press2p.className}`}>
                      <span style={{ color: PIXSELF_BRAND.colors.primary.navy }}>Shipping:</span>
                      <span style={{ color: PIXSELF_BRAND.colors.primary.navy }}>
                        {shippingFee === 0 ? 'FREE' : `${shippingFee.toLocaleString('vi-VN')} VND`}
                      </span>
                    </div>
                    <div 
                      className="flex justify-between font-bold text-[11px] border-t-2 pt-3"
                      style={{ borderColor: PIXSELF_BRAND.colors.primary.gold + '50' }}
                    >
                      <span 
                        className={press2p.className}
                        style={{ color: PIXSELF_BRAND.colors.primary.navy }}
                      >
                        TOTAL:
                      </span>
                      <span 
                        className={press2p.className}
                        style={{ 
                          color: PIXSELF_BRAND.colors.primary.gold,
                          textShadow: `1px 1px 0px ${PIXSELF_BRAND.colors.primary.navy}20`
                        }}
                      >
                        {finalTotal.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={isLoading}
                      className={`w-full px-6 py-4 text-[14px] font-bold tracking-wider border-4 
                        transition-all duration-200 flex items-center justify-center gap-2
                        focus:outline-none focus:ring-4 focus:ring-opacity-50
                        active:translate-x-1 active:translate-y-1
                        disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0
                        hover:brightness-110 hover:scale-105 ${press2p.className}`}
                      style={{
                        backgroundColor: isLoading ? PIXSELF_BRAND.colors.ui.muted : PIXSELF_BRAND.colors.accent.sparkle,
                        color: PIXSELF_BRAND.colors.cloud.white,
                        borderColor: isLoading ? PIXSELF_BRAND.colors.ui.muted : PIXSELF_BRAND.colors.accent.sparkle,
                        boxShadow: isLoading ? 'none' : `4px 4px 0px ${PIXSELF_BRAND.colors.primary.navy}40`
                      }}
                    >
                      {isLoading ? 'Processing Order...' : 'Complete Order'}
                    </button>
                  </div>
                </div>
              </PixselfPanel>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Popup */}
      <PaymentSuccessPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        orderData={orderResult}
      />
    </main>
  )
}