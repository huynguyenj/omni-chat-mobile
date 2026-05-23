export type ManagerPostSaleRequestLineItem = {
  orderItemId: string
  quantity: number
}

/** Yêu cầu hoàn / refund (post-sale). */
export type ManagerPostSaleRequestItem = {
  id: string
  orderId: string
  orderCode?: string
  orderStatus?: string
  status: string
  type?: string
  reason?: string
  refundAmount?: number
  requestedTime?: string
  customerName?: string
  presentByStaffName?: string
  postSaleItems?: ManagerPostSaleRequestLineItem[]
  createdAt?: string
}

export type ManagerPostSaleRequestListResponse = {
  items: ManagerPostSaleRequestItem[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}
