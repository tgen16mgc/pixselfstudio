import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { DiscountCode, DiscountValidationResult, calculateDiscount, validateDiscountCodeRules, CartItem } from '@/config/discount-codes'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, items, subtotal } = body

    if (!code || !items || typeof subtotal !== 'number') {
      return NextResponse.json({
        valid: false,
        message: 'Invalid request data'
      }, { status: 400 })
    }

    // Normalize the code (uppercase, trim)
    const normalizedCode = code.toString().trim().toUpperCase()

    // Query the database for the discount code
    const { data: discountCode, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single()

    if (error || !discountCode) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid discount code'
      })
    }

    // Convert database result to our interface
    const discount: DiscountCode = {
      id: discountCode.id,
      code: discountCode.code,
      discountType: discountCode.discount_type,
      discountValue: discountCode.discount_value,
      applyTo: discountCode.apply_to,
      minPurchase: discountCode.min_purchase,
      maxDiscount: discountCode.max_discount,
      isActive: discountCode.is_active,
      validFrom: discountCode.valid_from,
      validUntil: discountCode.valid_until,
      usageLimit: discountCode.usage_limit,
      usageCount: discountCode.usage_count
    }

    // Validate business rules
    const validation = validateDiscountCodeRules(discount, items, subtotal)
    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        message: validation.message
      })
    }

    // Calculate discount amount with conditional logic for PIXSELF codes
    let discountAmount = 0
    
    if (discount.applyTo === 'first_item') {
      const firstItem = items[0]
      if (!firstItem) {
        return NextResponse.json({
          valid: false,
          message: 'No items in cart'
        })
      }
      
      // For PIXSELF codes: conditional discount based on gift box
      if (firstItem.hasGiftBox) {
        // 10% off if has gift box
        discountAmount = Math.round(firstItem.price * 0.10)
      } else {
        // 15% off if no gift box
        discountAmount = Math.round(firstItem.price * 0.15)
      }
    } else {
      // Standard calculation for other discount types
      discountAmount = calculateDiscount(discount, items, subtotal)
    }

    if (discountAmount <= 0) {
      return NextResponse.json({
        valid: false,
        message: 'No discount applicable to your cart'
      })
    }

    // Return successful validation result
    const result: DiscountValidationResult = {
      valid: true,
      code: discount.code,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      applyTo: discount.applyTo,
      discountAmount,
      message: `Discount applied: ${discountAmount.toLocaleString('vi-VN')} VND off`
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Discount validation error:', error)
    return NextResponse.json({
      valid: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// Handle GET requests for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({
      valid: false,
      message: 'Code parameter required'
    }, { status: 400 })
  }

  // For GET requests, we'll just check if the code exists (without cart validation)
  try {
    const { data: discountCode, error } = await supabaseAdmin
      .from('discount_codes')
      .select('code, discount_type, discount_value, apply_to, is_active')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !discountCode) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid discount code'
      })
    }

    return NextResponse.json({
      valid: true,
      code: discountCode.code,
      discountType: discountCode.discount_type,
      discountValue: discountCode.discount_value,
      applyTo: discountCode.apply_to,
      message: 'Code exists and is active'
    })

  } catch (error) {
    console.error('Discount code check error:', error)
    return NextResponse.json({
      valid: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
