export type ManagerWalletTransaction = {
  id: string
  amount: number
  createDate: string
  transactionType: string
  invoiceId?: string
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
  zaloSenderId: string | null
  googleId: string
  currentProviderName: string
  totalOrder: number
  totalPayment: number
  customerDate: string
  getWalletResponse: PaycheckTransactionSummary
}

export type ManagerWalletPaymentPayload = {
  customerId: string
  amount: number
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


export interface PaycheckTransaction {
  id: string;
  amount: number;
  createDate: string;
  transactionType: string;
  paymentStatus: string
  invoiceId: string
}

export interface PaycheckTransactionSummary {
  id: string
  amount: number;
  totalDebt: number;
  netAmount: number;
  customerTransactions: PaycheckTransaction[];
}