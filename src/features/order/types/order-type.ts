import { BatchType } from './batch-type'
import type { ProductDetailType } from './product-type'

export type OrderItemType = {
  id: string
  quantity: number
  productName: string
  itemsPrice: number
}

export type OrderType = {
  id: string
  customerId: string
  customerName: string | null
  customerPhoneNumber: string | null
  customerEmail: string | null
  customerAddress: string | null
  orderDate: string
  name: string
  status: string
  totalAmount: number
  deliveryStatus: string
  code: string
  orderItems: OrderItemType[]
}

export type OrderItems = {
  productBatchId: string
  quantity: number
}

export type OrderRequestType = {
  customerId: string
  name: string
  orderItems: OrderItems[]
}

export type PostSaleItem = {
  orderItemId: string
  quantity: number
}

export type RefundOrderRequest = {
  customerId: string
  orderId: string
  presentByStaffId: string
  type: string
  reason: string
  postSaleItems: PostSaleItem[]
}

export interface OrderReviewType extends ProductDetailType {
   listBatch: BatchType[]
   orderItems: OrderItems[]
}