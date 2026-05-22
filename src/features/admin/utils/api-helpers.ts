import { isAxiosError } from 'axios'
import type { OrderDashboardMonthRow } from '../types/order-type'
import type { ProductType } from '../types/product-type'
import type { TaskIntentMonthRow } from '../types/support-task-type'
import type { TotalRevenue } from '../types/invoice-type'

/** Mirrors loose API envelopes used by admin endpoints (web parity). */

export function isApiSuccessLike(response: unknown): boolean {
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  if (typeof r.is_success === 'boolean') return r.is_success
  if (typeof r.isSuccess === 'boolean') return r.isSuccess
  return Number(r.status_code ?? r.statusCode ?? 0) === 200
}

export function extractArrayFromResponse(response: unknown): unknown[] {
  if (Array.isArray(response)) return response
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  if (Array.isArray(r.items)) return r.items
  if (Array.isArray(r.data)) return r.data
  const data = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : {}
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.data)) return data.data
  return []
}

export function extractProductTotalPages(response: unknown): number {
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  const data = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : {}
  const nestedData = data.data && typeof data.data === 'object' ? (data.data as Record<string, unknown>) : {}
  const metaCandidates = [
    data.meta,
    data.pagination,
    data.pageInfo,
    nestedData.meta,
    nestedData.pagination,
    nestedData.pageInfo,
    r.meta,
    r.pagination,
    r.pageInfo
  ]

  for (const meta of metaCandidates) {
    if (meta && typeof meta === 'object') {
      const m = meta as Record<string, unknown>
      const total = Number(m.total_pages ?? m.totalPages ?? 1)
      if (Number.isFinite(total) && total > 0) return total
    }
  }

  return 1
}

export function extractProductTotalItems(response: unknown): number {
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  const data = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : {}
  const nestedData = data.data && typeof data.data === 'object' ? (data.data as Record<string, unknown>) : {}
  const metaCandidates = [
    data.meta,
    data.pagination,
    data.pageInfo,
    nestedData.meta,
    nestedData.pagination,
    nestedData.pageInfo,
    r.meta,
    r.pagination,
    r.pageInfo
  ]

  for (const meta of metaCandidates) {
    if (meta && typeof meta === 'object') {
      const m = meta as Record<string, unknown>
      const total = Number(m.total_items ?? m.totalItems ?? 0)
      if (Number.isFinite(total) && total >= 0) return total
    }
  }

  return 0
}

export function normalizeCancelReasonMeta(raw: unknown): {
  total_pages: number
  total_items: number
  current_page: number
  page_size: number
} {
  const m = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    total_pages: Number(m.total_pages ?? m.totalPages ?? 0),
    total_items: Number(m.total_items ?? m.totalItems ?? 0),
    current_page: Number(m.current_page ?? m.currentPage ?? 1),
    page_size: Number(m.page_size ?? m.pageSize ?? 10)
  }
}

export function normalizePeriodInput(value: string): string | null {
  const trimmed = value.trim()
  if (/^\d{4}$/.test(trimmed)) return trimmed
  const monthYearMatch = /^(\d{1,2})\/(\d{4})$/.exec(trimmed)
  if (!monthYearMatch) return null
  const month = Number(monthYearMatch[1])
  if (month < 1 || month > 12) return null
  return `${String(month).padStart(2, '0')}/${monthYearMatch[2]}`
}

export function isAxiosNoDataError(error: unknown): boolean {
  return isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)
}

export function extractProductItems(response: unknown): ProductType[] {
  return extractArrayFromResponse(response) as ProductType[]
}

export function summarizeInventoryFromProducts(products: ProductType[], totalItems: number) {
  const totalProducts = products.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
  return { totalProducts, totalItems }
}

const PREFERRED_INTENT_NAMES = ['PRE_SALE', 'ORDER_CREATION', 'ORDER_STATUS', 'PAYMENT', 'POST_SALE_CHANGE']

export function collectIntentNames(rows: TaskIntentMonthRow[]): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    for (const item of row.intents ?? []) {
      if (item.intentName) set.add(item.intentName)
    }
  }
  const ordered = PREFERRED_INTENT_NAMES.filter((name) => set.has(name))
  const rest = [...set].filter((name) => !PREFERRED_INTENT_NAMES.includes(name)).sort()
  return [...ordered, ...rest]
}

export function sumTaskIntentByName(rows: TaskIntentMonthRow[], intentName: string): number {
  return rows.reduce((sum, row) => {
    const byIntent = new Map((row.intents ?? []).map((item) => [item.intentName, Number(item.taskCount ?? 0)]))
    return sum + Number(byIntent.get(intentName) ?? 0)
  }, 0)
}

export function buildTaskDashboardChartRows(rows: TaskIntentMonthRow[], intentNames: string[]) {
  const sorted = [...rows].sort((a, b) => a.month - b.month)
  return sorted.map((row) => {
    const byIntent = new Map((row.intents ?? []).map((i) => [i.intentName, i.taskCount]))
    const chartRow: Record<string, string | number> = {
      monthLabel: `T${String(row.month).padStart(2, '0')}`
    }
    let total = 0
    for (const name of intentNames) {
      const count = Number(byIntent.get(name) ?? 0)
      chartRow[name] = count
      total += count
    }
    chartRow.total = total
    return chartRow
  })
}

const PREFERRED_ORDER_STATUSES = ['Completed', 'Confirmed', 'Draft', 'Returned', 'Cancelled']

export function collectOrderDashboardStatusNames(rows: OrderDashboardMonthRow[]): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    for (const item of row.status ?? []) {
      if (item.status) set.add(item.status)
    }
  }
  const ordered = PREFERRED_ORDER_STATUSES.filter((name) => set.has(name))
  const rest = [...set].filter((name) => !PREFERRED_ORDER_STATUSES.includes(name)).sort((a, b) => a.localeCompare(b))
  return [...ordered, ...rest]
}

function parseOrderDashboardMonthSortKey(month: string): number {
  const m = /^(\d{1,2})\/(\d{4})$/.exec(month.trim())
  if (!m) return 0
  return Number(m[2]) * 100 + Number(m[1])
}

export function buildOrderDashboardChartRows(rows: OrderDashboardMonthRow[], statusNames: string[]) {
  const sorted = [...rows].sort(
    (a, b) => parseOrderDashboardMonthSortKey(a.month) - parseOrderDashboardMonthSortKey(b.month)
  )
  return sorted.map((row) => {
    const byStatus = new Map((row.status ?? []).map((s) => [s.status, s.count]))
    const chartRow: Record<string, string | number> = { monthLabel: row.month }
    let total = 0
    for (const name of statusNames) {
      const count = Number(byStatus.get(name) ?? 0)
      chartRow[name] = count
      total += count
    }
    chartRow.total = total
    return chartRow
  })
}

function normalizeRevenueRows(raw: unknown): TotalRevenue[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
    return {
      month: String(row.month ?? row.Month ?? ''),
      totalAmount: Number(row.totalAmount ?? row.total_amount ?? row.totalamount ?? 0)
    }
  })
}

export function extractRevenueRowsFromResponse(response: unknown): TotalRevenue[] {
  const fromRawArray = normalizeRevenueRows(response)
  if (fromRawArray.length > 0) return fromRawArray

  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  const direct = normalizeRevenueRows(r.data)
  if (direct.length > 0) return direct

  const fromItems = normalizeRevenueRows(r.items)
  if (fromItems.length > 0) return fromItems

  const nestedData = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : {}
  const nestedItems = normalizeRevenueRows(nestedData.items)
  if (nestedItems.length > 0) return nestedItems
  const nestedArray = normalizeRevenueRows(nestedData.data)
  if (nestedArray.length > 0) return nestedArray
  return []
}

export function extractOrderDashboardRowsFromResponse(response: unknown): OrderDashboardMonthRow[] {
  if (Array.isArray(response)) return response as OrderDashboardMonthRow[]
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  if (Array.isArray(r.data)) return r.data as OrderDashboardMonthRow[]
  if (Array.isArray(r.items)) return r.items as OrderDashboardMonthRow[]
  const data = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : {}
  if (Array.isArray(data.items)) return data.items as OrderDashboardMonthRow[]
  if (Array.isArray(data.data)) return data.data as OrderDashboardMonthRow[]
  return []
}

/** GET /orders/get/:id — BE có thể trả envelope hoặc object đơn trực tiếp. */
export function unwrapOrderDetailBody(
  response: unknown
): { ok: true; body: unknown } | { ok: false; message?: string } {
  if (!response || typeof response !== 'object') {
    return { ok: false, message: 'Phản hồi không hợp lệ.' }
  }

  const r = response as Record<string, unknown>

  if (typeof r.is_success === 'boolean') {
    if (!r.is_success) {
      return { ok: false, message: typeof r.message === 'string' ? r.message : undefined }
    }
    if (r.data && typeof r.data === 'object') {
      return { ok: true, body: r.data }
    }
    return { ok: false, message: typeof r.message === 'string' ? r.message : undefined }
  }

  if (r.data && typeof r.data === 'object') {
    const data = r.data as Record<string, unknown>
    if (data.id || data.code) {
      return { ok: true, body: r.data }
    }
  }

  if (r.id || r.code) {
    return { ok: true, body: r }
  }

  return { ok: false, message: 'Không có dữ liệu đơn hàng.' }
}

export function sumOrderStatus(rows: OrderDashboardMonthRow[], statusLabel: string): number {
  const target = statusLabel.toLowerCase()
  return rows.reduce((sum, row) => {
    const statuses = Array.isArray(row.status) ? row.status : []
    const matched = statuses.find((item) => String(item.status ?? '').toLowerCase() === target)
    return sum + Number(matched?.count ?? 0)
  }, 0)
}
