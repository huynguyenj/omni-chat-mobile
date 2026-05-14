export type ManagerOrderListQuery = {
  /** Giống web: ưu tiên `pageNumber`. */
  pageNumber?: number
  page?: number
  pageIndex?: number
  pageSize?: number
  search?: string
  orderStatuses?: string[]
  sortBy?: string
  /** Mặc định true (giống web). */
  descending?: boolean
}

export type ManagerOrderItem = {
  id: string
  code: string
  name: string
  customerName: string
  customerPhone: string
  customerAddress: string
  orderDate: string
  status: string
  deliveryStatus: string | number
  totalAmount: number
  shipperId?: string | null
}

export type ManagerOrderLineItem = {
  id: string
  quantity: number
  productName: string
  itemsPrice: number | null
}

export type ManagerOrderDetail = ManagerOrderItem & {
  orderItems: ManagerOrderLineItem[]
  /** ISO / chuỗi từ API nếu có (hiển thị «Cập nhật»). */
  updatedAt?: string
}

export type ManagerOrderListResponse = {
  items: ManagerOrderItem[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}

export type ManagerOrderStatusFilterValue =
  | 'Draft'
  | 'Pending'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled'
  | 'PendingReturn'
  | 'Returned'
  | 'ReturnedDefective'
