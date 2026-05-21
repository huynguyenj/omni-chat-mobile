import { ManagerOrderApi } from '../api/manager-order-api'
import type { ManagerPostSaleRequestItem } from '../types/manager-post-sale-request-type'

type OrderSummaryCache = { code?: string; status?: string }

const orderSummaryByIdCache = new Map<string, OrderSummaryCache>()

function pickStr(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (c == null) continue
    const s = String(c).trim()
    if (s !== '') return s
  }
  return ''
}

function flattenPostSalePayload(raw: unknown): Record<string, unknown> {
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? { ...(raw as Record<string, unknown>) } : {}
  const innerKeys = [
    'order',
    'Order',
    'orders',
    'Orders',
    'orderInfo',
    'OrderInfo',
    'order_info',
    'orderDetail',
    'OrderDetail',
    'orderDto',
    'OrderDto'
  ]
  let merged: Record<string, unknown> = {}
  for (const k of innerKeys) {
    const inner = o[k]
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      merged = { ...merged, ...(inner as Record<string, unknown>) }
    }
  }
  return { ...merged, ...o }
}

export function normalizePostSaleRequest(raw: unknown): ManagerPostSaleRequestItem {
  const o = flattenPostSalePayload(raw)
  const orderId = pickStr(o.orderId, o.OrderId, o.order_id)
  const orderCode = pickStr(
    o.orderCode,
    o.OrderCode,
    o.order_code,
    o.code,
    o.Code,
    o.orderNumber,
    o.OrderNumber,
    o.order_number
  )
  const orderStatus = pickStr(
    o.orderStatus,
    o.OrderStatus,
    o.order_status,
    o.statusOrder,
    o.StatusOrder
  )
  return {
    id: pickStr(o.id, o.Id, o.requestId, o.RequestId),
    orderId,
    orderCode: orderCode || undefined,
    orderStatus: orderStatus || undefined,
    status: pickStr(o.status, o.Status, o.requestStatus, o.RequestStatus) || '—',
    reason: pickStr(o.reason, o.Reason) || undefined,
    type: pickStr(o.type, o.Type) || undefined,
    createdAt: pickStr(o.createdAt, o.CreatedAt, o.created_at) || undefined
  }
}

async function resolveOrderSummaryFromOrderApi(orderId: string): Promise<OrderSummaryCache> {
  const cached = orderSummaryByIdCache.get(orderId)
  if (cached?.code && cached?.status) return cached
  try {
    const order = await ManagerOrderApi.getOrderById(orderId)
    const summary: OrderSummaryCache = {
      code: pickStr(order.code) || cached?.code,
      status: pickStr(order.status) || cached?.status
    }
    orderSummaryByIdCache.set(orderId, summary)
    return summary
  } catch {
    return cached ?? {}
  }
}

/** List post-sale thường thiếu mã/trạng thái đơn — bổ sung từ GET đơn giống modal chi tiết. */
export async function enrichPostSaleRequestsWithOrderInfo(
  items: ManagerPostSaleRequestItem[]
): Promise<ManagerPostSaleRequestItem[]> {
  const needsFetch = items.filter((i) => i.orderId && (!i.orderCode || !i.orderStatus))
  if (needsFetch.length === 0) return items

  const summaries = await Promise.all(needsFetch.map((i) => resolveOrderSummaryFromOrderApi(i.orderId)))
  const summaryByOrderId = new Map<string, OrderSummaryCache>()
  needsFetch.forEach((item, idx) => {
    summaryByOrderId.set(item.orderId, summaries[idx])
  })

  return items.map((item) => {
    const summary = summaryByOrderId.get(item.orderId)
    if (!summary) return item
    return {
      ...item,
      orderCode: item.orderCode ?? summary.code,
      orderStatus: item.orderStatus ?? summary.status
    }
  })
}

/** @deprecated Dùng enrichPostSaleRequestsWithOrderInfo */
export const enrichPostSaleRequestsWithOrderCodes = enrichPostSaleRequestsWithOrderInfo
