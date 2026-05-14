export type OrderStatus = 'Draft' | 'Confirmed' | 'Completed' | 'Cancelled'
export type DeliveryStatus = 'Pending' | 'Processing' | 'Delivered' | 'Cancelled'

export type AdminOrderItem = {
  id: string
  customerId: string
  customerName?: string
  orderDate: string
  name: string
  status: OrderStatus | string
  totalAmount: number
  deliveryStatus: DeliveryStatus | string
  code: string
}

export type AdminOrderDetailItem = {
  id: string
  quantity: number
  productName: string
  itemsPrice: number | null
}

export type AdminOrderDetail = {
  id: string
  customerId: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerAddress?: string
  orderDate: string
  name: string
  status: OrderStatus | string
  totalAmount: number
  deliveryStatus: DeliveryStatus | string
  code: string
  orderItems: AdminOrderDetailItem[]
}

export type OrderPaginationMeta = {
  total_pages: number
  total_items: number
  current_page: number
  page_size: number
}

export type OrderListResponse = {
  items: AdminOrderItem[]
  meta: OrderPaginationMeta
}

export type OrderDashboardStatusEntry = {
  status: string
  count: number
}

export type OrderDashboardMonthRow = {
  month: string
  status: OrderDashboardStatusEntry[]
}
