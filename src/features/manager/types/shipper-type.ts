export type ManagerShipperListQuery = {
  pageIndex: number
  pageSize: number
}

export type ManagerShipperApiItem = {
  id: string
  fullName: string
  userName?: string
  phone?: string
  shipperStatus: string
  /** Số đơn đang giao (tên field backend có thể khác — normalize map). */
  deliveringCount: number
  /** Số đơn đã giao xong. */
  deliveredCount: number
}

export type ManagerShipperListResponse = {
  items: ManagerShipperApiItem[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}
