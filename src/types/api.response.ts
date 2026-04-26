export type ApiResponseStructure<T> = {
  status_code: number
  message: string
  reason: string
  is_success: true
  data: T
}

export type PaginationStructure<T> = {
  items: T[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}