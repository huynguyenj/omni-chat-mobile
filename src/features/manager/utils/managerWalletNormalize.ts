import type { ManagerCustomerWalletItem, ManagerWalletResponse, ManagerWalletTransaction } from '../types/manager-wallet-type'
import { formatKpiMoney } from './managerInvoicesNormalize'

function pickStr(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}

function pickNum(v: unknown): number {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function normalizeTransaction(raw: unknown): ManagerWalletTransaction {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    id: pickStr(r.id ?? r.transactionId ?? r.transaction_id),
    amount: pickNum(r.amount),
    createDate: pickStr(r.createDate ?? r.create_date ?? r.createdAt ?? r.created_at ?? r.date),
    transactionType: pickStr(r.transactionType ?? r.transaction_type ?? r.type).toLowerCase()
  }
}

function normalizeWalletResponse(raw: unknown): ManagerWalletResponse {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const txRaw = r.transactions ?? r.transactionList ?? r.transaction_list
  const transactions = Array.isArray(txRaw) ? txRaw.map(normalizeTransaction) : []
  return {
    amount: pickNum(r.amount ?? r.balance ?? r.walletAmount),
    totalDebt: pickNum(r.totalDebt ?? r.total_debt ?? r.debt),
    netAmount: pickNum(r.netAmount ?? r.net_amount ?? r.net),
    transactions
  }
}

export function normalizeCustomerWallet(raw: unknown): ManagerCustomerWalletItem {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const walletRaw =
    r.getWalletResponse ??
    r.get_wallet_response ??
    r.walletResponse ??
    r.wallet ??
    r.customerWallet ??
    r.customer_wallet

  return {
    id: pickStr(r.id ?? r.customerId ?? r.customer_id),
    customerName: pickStr(r.customerName ?? r.customer_name ?? r.name ?? r.fullName),
    email: pickStr(r.email ?? r.customerEmail ?? r.customer_email),
    phoneNumber: pickStr(r.phoneNumber ?? r.phone_number ?? r.phone ?? r.mobile),
    avatarUrl: pickStr(r.avatarUrl ?? r.avatar_url ?? r.avatar ?? r.imageUrl),
    facebookId: pickStr(r.facebookId ?? r.facebook_id),
    zaloId: pickStr(r.zaloId ?? r.zalo_id),
    googleId: pickStr(r.googleId ?? r.google_id),
    currentProviderName: pickStr(r.currentProviderName ?? r.current_provider_name ?? r.providerName ?? r.provider),
    totalOrder: pickNum(r.totalOrder ?? r.total_order ?? r.orderCount),
    totalPayment: pickNum(r.totalPayment ?? r.total_payment ?? r.paymentTotal),
    customerDate: pickStr(r.customerDate ?? r.customer_date ?? r.createdAt ?? r.created_at ?? r.registerDate),
    getWalletResponse: normalizeWalletResponse(walletRaw ?? {})
  }
}

export function customerInitial(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  const ch = t.charAt(0)
  return ch.toLocaleUpperCase('vi-VN')
}

export function transactionTypeLabel(type: string): string {
  const t = type.toLowerCase()
  if (t === 'deposit') return 'Nạp tiền'
  if (t === 'credit') return 'Ghi có'
  if (t === 'debit') return 'Ghi nợ'
  return type || '—'
}

export function formatWalletMoney(n: number): string {
  return formatKpiMoney(n)
}
