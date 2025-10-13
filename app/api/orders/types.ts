// Shared types for order system
export interface OrderItem {
  id: string
  pngDataUrl: string
  nametag: string
  hasCharm: boolean
  createdAt: string
}

export interface OrderFormData {
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

export interface OrderData {
  items: OrderItem[]
  formData: OrderFormData
  totalPrice: number
}

export interface OrderResponse {
  success: boolean
  orderId: string
  message: string
  estimatedDelivery: string
}

export interface OrderStatus {
  orderId: string
  status: 'pending' | 'processing' | 'completed' | 'shipped' | 'delivered'
  estimatedCompletion: string
  items: number
  createdAt: string
  updatedAt: string
}
