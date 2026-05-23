/** Nhãn UI tiếng Việt cho manager (giá trị API tiếng Anh). */

export function postSaleTypeLabelVi(type: string): string {
  const t = type.trim().toLowerCase()
  if (t === 'refund') return 'Hoàn tiền'
  if (t === 'return') return 'Trả hàng'
  return type.trim() || '—'
}

export function postSaleRequestStatusLabelVi(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('pending')) return 'Chờ duyệt'
  if (s.includes('approve')) return 'Đã duyệt'
  if (s.includes('reject')) return 'Đã từ chối'
  return status || '—'
}

export function changeTaskStatusLabelVi(status: string): string {
  return postSaleRequestStatusLabelVi(status)
}

export function intentTypeLabelVi(name: string): string {
  const key = name.trim().toUpperCase().replace(/\s+/g, '_')
  const map: Record<string, string> = {
    ORDER_CREATION: 'Tạo đơn',
    POST_SALE_CHANGE: 'Hậu mãi',
    CUSTOMER_SUPPORT: 'Hỗ trợ KH',
    SHIPPING: 'Giao hàng',
    PAYMENT: 'Thanh toán'
  }
  return map[key] ?? (name.trim() || '—')
}

export function claimTypeLabelVi(type: string): string {
  const raw = type.trim()
  if (!raw) return 'Yêu cầu'
  if (raw.toLowerCase() === 'claim') return 'Yêu cầu'
  return intentTypeLabelVi(raw)
}

export function walletTransactionTypeLabelVi(type: string): string {
  const t = type.toLowerCase()
  if (t === 'deposit') return 'Nạp tiền vào ví'
  if (t === 'credit') return 'Hoàn tiền lại ví'
  if (t === 'debit') return 'Trừ tiền ví'
  return type || 'Khác'
}
