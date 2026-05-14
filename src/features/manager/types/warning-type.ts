/** Danh sách / thẻ cảnh báo (đã chuẩn hoá cho UI). */
export type ManagerWarningItem = {
  id: string
  conversationId: string
  warningType: string
  isReviewed: boolean
  createdAt: string
  title: string
  preview: string
}

export type ManagerWarningListResponse = {
  items: ManagerWarningItem[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}

/** Chi tiết (mở rộng so với item list; backend có thể trả thêm field). */
export type ManagerWarningDetailResponse = ManagerWarningItem & {
  description?: string
  conversationTitle?: string
  staffName?: string
  customerName?: string
  extra?: Record<string, unknown>
}
