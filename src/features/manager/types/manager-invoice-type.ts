export type ManagerInvoiceItem = {
  id: string
  customerId: string
  customerName: string
  customerPhoneNumber: string
  customerEmail: string
  customerAddress: string
  startedDate: string
  endedDate: string
  total: number
  invoiceStatus: string
  invoiceMethod: string
  completedDate: string
  paidAmount: number
  deductedAmount: number
}

export type ManagerInvoiceListQuery = {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  descending?: boolean
  invoiceId?: string
  status?: string
}

export type ManagerInvoiceListResponse = {
  items: ManagerInvoiceItem[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}

export type ManagerInvoiceStatusFilter = 'pending' | 'completed' | 'pendingrefund' | 'refunded' | null

export type ManagerInvoiceSortColumn =
  | 'customerName'
  | 'customerEmail'
  | 'customerPhoneNumber'
  | 'invoiceMethod'
  | 'startedDate'
  | 'endedDate'
  | 'total'
  | 'invoiceStatus'
