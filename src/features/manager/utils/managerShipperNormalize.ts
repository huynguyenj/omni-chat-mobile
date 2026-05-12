import type { ManagerShipperApiItem } from '../types/shipper-type'

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

export function normalizeShipper(raw: unknown): ManagerShipperApiItem {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const fullName = String(o.fullName ?? o.full_name ?? o.name ?? o.userName ?? o.user_name ?? 'Shipper')
  const phoneRaw =
    o.phone ?? o.phoneNumber ?? o.phone_number ?? o.mobile ?? o.tel ?? o.customerPhone ?? o.customer_phone
  const deliveringCount = num(
    o.deliveringCount ??
      o.delivering_count ??
      o.deliveringOrders ??
      o.delivering_orders ??
      o.pendingDeliveries ??
      o.pending_deliveries ??
      o.activeDeliveryCount ??
      o.active_delivery_count ??
      o.dangGiao ??
      o.dang_giao
  )
  const deliveredCount = num(
    o.deliveredCount ??
      o.delivered_count ??
      o.deliveredOrders ??
      o.delivered_orders ??
      o.completedDeliveries ??
      o.completed_deliveries ??
      o.totalDelivered ??
      o.total_delivered ??
      o.daGiao ??
      o.da_giao
  )
  return {
    id: String(o.id ?? ''),
    fullName,
    userName: o.userName != null ? String(o.userName) : o.user_name != null ? String(o.user_name) : undefined,
    phone: phoneRaw != null && String(phoneRaw).trim() !== '' ? String(phoneRaw) : undefined,
    shipperStatus: String(o.shipperStatus ?? o.shipper_status ?? o.status ?? o.accountStatus ?? 'Offline'),
    deliveringCount,
    deliveredCount
  }
}

export function shipperIsOnline(item: ManagerShipperApiItem): boolean {
  const s = item.shipperStatus.toLowerCase()
  return (
    s === 'online' ||
    s === '1' ||
    s === 'true' ||
    s.includes('active') ||
    s.includes('hoạt động') ||
    s.includes('hoat dong')
  )
}

/** Nhãn trạng thái giống web (Hoạt động / tạm nghỉ). */
export function shipperActivityPill(item: ManagerShipperApiItem): { label: string; active: boolean } {
  const active = shipperIsOnline(item)
  return { label: active ? 'Hoạt động' : 'Tạm nghỉ', active }
}
