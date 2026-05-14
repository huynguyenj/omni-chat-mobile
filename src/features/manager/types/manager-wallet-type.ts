export type ManagerWalletTransaction = {
  id: string
  amount: number
  createDate: string
  transactionType: string
}

export type ManagerWalletResponse = {
  amount: number
  totalDebt: number
  netAmount: number
  transactions: ManagerWalletTransaction[]
}

export type ManagerCustomerWalletItem = {
  id: string
  customerName: string
  email: string
  phoneNumber: string
  avatarUrl: string
  facebookId: string
  zaloId: string
  googleId: string
  currentProviderName: string
  totalOrder: number
  totalPayment: number
  customerDate: string
  getWalletResponse: ManagerWalletResponse
}

export type ManagerWalletPagingQuery = {
  pageNumber?: number
  pageSize?: number
  customerName?: string
}

export type ManagerWalletPagingResponse = {
  items: ManagerCustomerWalletItem[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}
