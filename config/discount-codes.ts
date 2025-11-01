// Discount Code Configuration and Utilities
// This file provides types and calculation functions for the discount code system

export interface DiscountCode {
  id?: string
  code: string
  discountType: 'percentage' | 'fixed' | 'gift'
  discountValue: number
  applyTo: 'total' | 'first_item'
  minPurchase?: number
  maxDiscount?: number
  isActive: boolean
  validFrom?: string
  validUntil?: string
  usageLimit?: number
  usageCount?: number
}

export interface DiscountValidationResult {
  valid: boolean
  code?: string
  discountType?: 'percentage' | 'fixed' | 'gift'
  discountValue?: number
  applyTo?: 'total' | 'first_item'
  discountAmount?: number
  giftType?: 'loopy_charm'
  isGiftCode?: boolean
  message?: string
}

export interface CartItem {
  id: string
  nametag: string
  hasCharm: boolean
  hasGiftBox: boolean
  hasExtraItems: boolean
  price: number
}

// Base pricing constants
export const PRICING = {
  BASE_KEYCHAIN: 49000,
  CHARM_PRICE: 6000,
  GIFT_BOX_PRICE: 40000,
  SHIPPING_DELIVERY: 20000
} as const

/**
 * Calculate the discount amount for a given discount code and cart
 */
export function calculateDiscount(
  discountCode: DiscountCode,
  items: CartItem[],
  subtotal: number
): number {
  if (!discountCode.isActive) {
    return 0
  }

  // Check minimum purchase requirement
  if (discountCode.minPurchase && subtotal < discountCode.minPurchase) {
    return 0
  }

  let discountAmount = 0

  if (discountCode.applyTo === 'first_item') {
    // Apply discount only to the first item
    const firstItem = items[0]
    if (!firstItem) return 0

    const firstItemPrice = firstItem.price

    if (discountCode.discountType === 'percentage') {
      discountAmount = Math.round(firstItemPrice * (discountCode.discountValue / 100))
    } else {
      discountAmount = Math.min(discountCode.discountValue, firstItemPrice)
    }
  } else {
    // Apply discount to total
    if (discountCode.discountType === 'percentage') {
      discountAmount = Math.round(subtotal * (discountCode.discountValue / 100))
    } else {
      discountAmount = Math.min(discountCode.discountValue, subtotal)
    }
  }

  // Apply maximum discount cap if specified
  if (discountCode.maxDiscount && discountAmount > discountCode.maxDiscount) {
    discountAmount = discountCode.maxDiscount
  }

  return Math.max(0, discountAmount)
}

/**
 * Calculate item price including all add-ons
 */
export function calculateItemPrice(item: CartItem): number {
  let price = PRICING.BASE_KEYCHAIN
  
  if (item.hasCharm) {
    price += PRICING.CHARM_PRICE
  }
  
  if (item.hasGiftBox) {
    price += PRICING.GIFT_BOX_PRICE
  }
  
  // Note: Extra items pricing is handled separately in the business logic
  // as it may have special conditions (e.g., free with gift box)
  
  return price
}

/**
 * Calculate total cart value
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + calculateItemPrice(item), 0)
}

/**
 * Validate discount code against business rules
 */
export function validateDiscountCodeRules(
  discountCode: DiscountCode,
  items: CartItem[],
  subtotal: number,
  currentDate: Date = new Date()
): { valid: boolean; message?: string } {
  // Check if code is active
  if (!discountCode.isActive) {
    return { valid: false, message: 'Discount code is not active' }
  }

  // Check date validity
  if (discountCode.validFrom) {
    const validFrom = new Date(discountCode.validFrom)
    if (currentDate < validFrom) {
      return { valid: false, message: 'Discount code is not yet valid' }
    }
  }

  if (discountCode.validUntil) {
    const validUntil = new Date(discountCode.validUntil)
    if (currentDate > validUntil) {
      return { valid: false, message: 'Discount code has expired' }
    }
  }

  // Check minimum purchase requirement
  if (discountCode.minPurchase && subtotal < discountCode.minPurchase) {
    return { 
      valid: false, 
      message: `Minimum purchase of ${discountCode.minPurchase.toLocaleString('vi-VN')} VND required` 
    }
  }

  // Check usage limit
  if (discountCode.usageLimit && discountCode.usageCount && discountCode.usageCount >= discountCode.usageLimit) {
    return { valid: false, message: 'Discount code usage limit reached' }
  }

  return { valid: true }
}

/**
 * Format discount amount for display
 */
export function formatDiscountAmount(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} VND`
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value}%`
}

/**
 * Get discount description for display
 */
export function getDiscountDescription(discountCode: DiscountCode): string {
  if (discountCode.discountType === 'gift') {
    return 'Free Loopy Charm for all items'
  }
  if (discountCode.discountType === 'percentage') {
    return `${discountCode.discountValue}% off${discountCode.applyTo === 'first_item' ? ' first item' : ''}`
  } else {
    return `${formatDiscountAmount(discountCode.discountValue)} off${discountCode.applyTo === 'first_item' ? ' first item' : ''}`
  }
}
