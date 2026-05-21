/** Yêu cầu hoàn / refund (post-sale) — map thêm field khi biết contract API. */
export type ManagerPostSaleRequestItem = {
  id: string
  orderId: string
  /** Mã đơn hiển thị (khác UUID orderId). */
  orderCode?: string
  /** Trạng thái đơn (Draft, RefundApproved, …). */
  orderStatus?: string
  /** Trạng thái yêu cầu hoàn/refund. */
  status: string
  reason?: string
  type?: string
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
