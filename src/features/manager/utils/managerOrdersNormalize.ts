import type { ManagerOrderDetail, ManagerOrderItem, ManagerOrderLineItem } from '../types/manager-order-type'

function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function pickStr(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (c == null) continue
    const s = String(c).trim()
    if (s !== '') return s
  }
  return ''
}

function pickCustomerFromOrder(o: Record<string, unknown>) {
  const cust =
    o.customer && typeof o.customer === 'object' && !Array.isArray(o.customer)
      ? (o.customer as Record<string, unknown>)
      : null
  const customerName = pickStr(
    o.customerName,
    o.CustomerName,
    o.customer_name,
    cust?.fullName,
    cust?.FullName,
    cust?.name,
    cust?.Name,
    cust?.customerName,
    cust?.CustomerName
  )
  const customerPhone = pickStr(
    o.customerPhone,
    o.CustomerPhone,
    o.customer_phone,
    o.customerPhoneNumber,
    o.CustomerPhoneNumber,
    cust?.phone,
    cust?.Phone,
    cust?.phoneNumber,
    cust?.PhoneNumber,
    cust?.mobile,
    cust?.Mobile
  )
  const customerAddress = pickStr(
    o.customerAddress,
    o.CustomerAddress,
    o.customer_address,
    cust?.address,
    cust?.Address,
    cust?.fullAddress,
    cust?.FullAddress
  )
  return { customerName, customerPhone, customerAddress }
}

/** Chuẩn hoá item đơn (list + detail) — tương đương normalizeOrderItem trên web. */
export function normalizeOrderItem(raw: unknown): ManagerOrderItem {
  return normalizeOrder(raw)
}

export function normalizeOrder(raw: unknown): ManagerOrderItem {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const { customerName, customerPhone, customerAddress } = pickCustomerFromOrder(o)
  return {
    id: pickStr(o.id, o.Id),
    code: pickStr(o.code, o.Code, o.orderCode, o.OrderCode),
    name: pickStr(o.name, o.Name),
    customerName,
    customerPhone,
    customerAddress,
    orderDate: pickStr(o.orderDate, o.OrderDate, o.order_date, o.createdAt, o.CreatedAt),
    status: pickStr(o.status, o.Status, o.orderStatus, o.OrderStatus),
    deliveryStatus: (() => {
      const v =
        o.deliveryStatus ??
        o.DeliveryStatus ??
        o.delivery_status ??
        o.DeliveryState ??
        o.delivery_state
      if (typeof v === 'number' || typeof v === 'string') return v
      if (v != null) return String(v)
      return ''
    })(),
    totalAmount: num(o.totalAmount ?? o.TotalAmount ?? o.total_amount),
    shipperId: pickStr(o.shipperId, o.ShipperId, o.shipper_id) || null
  }
}

export function normalizeOrderLine(raw: unknown): ManagerOrderLineItem {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    id: pickStr(o.id, o.Id),
    quantity: num(o.quantity ?? o.Quantity, 0),
    productName: pickStr(o.productName, o.ProductName, o.product_name),
    itemsPrice:
      o.itemsPrice != null
        ? num(o.itemsPrice)
        : o.ItemsPrice != null
          ? num(o.ItemsPrice)
          : o.items_price != null
            ? num(o.items_price)
            : null
  }
}

export function normalizeOrderDetail(raw: unknown): ManagerOrderDetail {
  const base = normalizeOrderItem(raw)
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const linesRaw = o.orderItems ?? o.order_items ?? o.OrderItems
  const orderItems = Array.isArray(linesRaw) ? (linesRaw as unknown[]).map(normalizeOrderLine) : []
  return { ...base, orderItems }
}

export function isDeliveryPending(deliveryStatus: unknown): boolean {
  const s = String(deliveryStatus ?? '').trim().toLowerCase()
  return s === '0' || s === 'pending'
}

export function canCancelOrder(order: Pick<ManagerOrderItem, 'status' | 'deliveryStatus'>): boolean {
  const st = String(order.status ?? '').toLowerCase()
  if (st.includes('cancel')) return false
  return isDeliveryPending(order.deliveryStatus)
}

export function canSubmitDraftOrder(detail: ManagerOrderItem, fromPostSaleList: boolean): boolean {
  return String(detail.status) === 'Draft' && !fromPostSaleList
}

export function orderStatusPill(status: string): { label: string; color: string; bg: string } {
  const empty = { label: '—', color: '#64748b', bg: '#f1f5f9' }
  const raw = String(status ?? '').trim()
  if (!raw) return empty
  const map: Record<string, { label: string; color: string; bg: string }> = {
    Draft: { label: 'Nháp', color: '#64748b', bg: '#f1f5f9' },
    Pending: { label: 'Chờ xử lý', color: '#b45309', bg: '#fef3c7' },
    Shipped: { label: 'Đã gửi', color: '#1e40af', bg: '#dbeafe' },
    Confirmed: { label: 'Đã xác nhận', color: '#1d4ed8', bg: '#dbeafe' },
    Completed: { label: 'Hoàn tất', color: '#15803d', bg: '#dcfce7' },
    Cancelled: { label: 'Đã hủy', color: '#b91c1c', bg: '#fee2e2' },
    PendingReturn: { label: 'Chờ trả hàng', color: '#c2410c', bg: '#ffedd5' },
    Returned: { label: 'Đã trả', color: '#0369a1', bg: '#e0f2fe' },
    ReturnedDefective: { label: 'Trả lỗi', color: '#9f1239', bg: '#fce7f3' }
  }
  const hit = (Object.keys(map) as (keyof typeof map)[]).find((k) => k.toLowerCase() === raw.toLowerCase())
  if (hit) return map[hit]
  return { label: raw, color: '#334155', bg: '#e2e8f0' }
}

export function deliveryStatusPill(deliveryStatus: unknown): { label: string; color: string; bg: string } {
  const s = String(deliveryStatus ?? '').trim().toLowerCase()
  if (s === '0' || s === 'pending') return { label: 'Chờ giao', color: '#b45309', bg: '#fef3c7' }
  if (s === 'processing' || s === '1') return { label: 'Đang giao', color: '#1e40af', bg: '#e0e7ff' }
  if (s === 'delivered' || s === 'completed' || s === '2' || s === 'shipped')
    return { label: 'Đã giao', color: '#15803d', bg: '#dcfce7' }
  if (s === 'cancelled' || s === 'canceled') return { label: 'Giao hủy', color: '#b91c1c', bg: '#fee2e2' }
  return { label: String(deliveryStatus ?? '—'), color: '#475569', bg: '#f1f5f9' }
}
