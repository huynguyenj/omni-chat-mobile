import type { ManagerPostSaleRequestItem } from '../types/manager-post-sale-request-type'

export function normalizePostSaleRequest(raw: unknown): ManagerPostSaleRequestItem {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    id: String(o.id ?? ''),
    orderId: String(o.orderId ?? o.order_id ?? ''),
    status: String(o.status ?? ''),
    reason: o.reason != null ? String(o.reason) : undefined,
    type: o.type != null ? String(o.type) : undefined,
    createdAt: o.createdAt != null ? String(o.createdAt) : o.created_at != null ? String(o.created_at) : undefined
  }
}
