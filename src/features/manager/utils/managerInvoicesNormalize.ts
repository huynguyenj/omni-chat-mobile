import type { ManagerInvoiceItem } from '../types/manager-invoice-type'

function pickStr(v: unknown): string {
  if (v == null) return ''
  return String(v).trim()
}

function pickNum(v: unknown): number {
  if (v == null || v === '') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Thứ tự sort trạng thái giống web: pending → pendingrefund → completed → refunded */
export function normInvoiceStatus(status: string): string {
  return status.toLowerCase().replace(/\s+/g, '')
}

export function invoiceStatusSortRank(status: string): number {
  const s = normInvoiceStatus(status)
  if (s === 'pending') return 0
  if (s === 'pendingrefund') return 1
  if (s === 'completed') return 2
  if (s === 'refunded') return 3
  return 99
}

export function normalizeInvoice(raw: unknown): ManagerInvoiceItem {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const id = pickStr(r.id ?? r.invoiceId ?? r.invoice_id)
  const customer = r.customer && typeof r.customer === 'object' ? (r.customer as Record<string, unknown>) : {}

  return {
    id,
    customerId: pickStr(r.customerId ?? r.customer_id ?? customer.id ?? customer.customerId),
    customerName: pickStr(
      r.customerName ?? r.customer_name ?? customer.name ?? customer.fullName ?? customer.customerName
    ),
    customerPhoneNumber: pickStr(
      r.customerPhoneNumber ??
        r.customer_phone_number ??
        customer.phoneNumber ??
        customer.phone ??
        customer.customerPhoneNumber
    ),
    customerEmail: pickStr(r.customerEmail ?? r.customer_email ?? customer.email ?? customer.customerEmail),
    customerAddress: pickStr(
      r.customerAddress ?? r.customer_address ?? customer.address ?? customer.customerAddress
    ),
    startedDate: pickStr(r.startedDate ?? r.started_date ?? r.startDate),
    endedDate: pickStr(r.endedDate ?? r.ended_date ?? r.endDate),
    total: pickNum(r.total ?? r.amount),
    invoiceStatus: pickStr(r.invoiceStatus ?? r.invoice_status ?? r.status),
    invoiceMethod: pickStr(r.invoiceMethod ?? r.invoice_method ?? r.method ?? r.paymentMethod),
    completedDate: pickStr(r.completedDate ?? r.completed_date),
    paidAmount: pickNum(r.paidAmount ?? r.paid_amount),
    deductedAmount: pickNum(r.deductedAmount ?? r.deducted_amount)
  }
}

export function formatKpiMoney(n: number): string {
  try {
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(n))
  } catch {
    return String(Math.round(n))
  }
}

export function sanitizeInvoiceFileCustomerName(name: string): string {
  const t = name.trim() || 'invoice'
  return t.replace(/[/\\:*?"<>|]+/g, '_').replace(/\s+/g, '_').slice(0, 80)
}
