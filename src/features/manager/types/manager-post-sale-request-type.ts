/** Yêu cầu hoàn / refund (post-sale) — map thêm field khi biết contract API. */
export type ManagerPostSaleRequestItem = {
  id: string
  orderId: string
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
