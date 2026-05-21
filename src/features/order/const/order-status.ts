type OrderStatusType = {
   name: string
   tagVariant: 'success' | 'danger' | 'warning' | 'default' | 'gray'
}

type FilterType = {
      label: string,
      value: string
}

export const FILTER_LIST: FilterType[] = [
   { label: 'Bản nháp', value: 'Draft' },
   { label: 'Chờ xử lí', value: 'Pending' },
   { label: 'Đã hủy', value: 'Cancelled' },
   { label: 'Đã giao', value: 'Shipped' },
   { label: 'Chờ trả hàng', value: 'PendingReturn' },
   { label: 'Đã trả hàng', value: 'Returned' },
   { label: 'Hoàn thành', value: 'Completed' },
   { label: 'Đã trả hàng lỗi', value: 'ReturnedDefective' },
   { label: 'Từ chối trả hàng', value: 'ReturnRejected' },
   { label: 'Từ chối hoàn hàng', value: 'RefundRejected' },
   { label: 'Chấp nhận hoàn hàng', value: 'RefundApproved' },
   { label: 'Chấp nhận trả hàng', value: 'ReturnApproved' },
] 

export const ORDER_STATUS: Record<string, OrderStatusType> = {
  Draft: {
    name: 'Bản nháp',
    tagVariant: 'gray'
  },
  Pending: {
    name: 'Chờ xử lí',
    tagVariant: 'default'
  },
  Cancelled: {
    name: 'Đã hủy',
    tagVariant: 'danger'
  },
  Shipped: {
    name: 'Đã giao hàng',
    tagVariant: 'success'
  },
  PendingReturn: {
    name: 'Chờ trả hàng',
    tagVariant: 'warning'
  },
  Returned: {
    name: 'Đã trả hàng',
    tagVariant: 'danger'
  },
  Completed: {
    name: 'Hoàn thành',
    tagVariant: 'success'
  },
  ReturnedDefective: {
    name: 'Đã trả hàng do lỗi',
    tagVariant: 'danger'
  },
  ReturnRejected: {
    name: 'Từ chối trả hàng',
    tagVariant: 'danger'
  },
  RefundRejected: {
    name: 'Từ chối hoàn hàng',
    tagVariant: 'danger'
  },
  RefundApproved: {
    name: 'Chấp nhận hoàn hàng',
    tagVariant: 'success'
  },
  ReturnApproved: {
    name: 'Chấp nhận trả hàng',
    tagVariant: 'success'
  }
}

export const DELIVERY_STATUS: Record<string, OrderStatusType> = {
  Pending: {
    name: 'Chờ ship',
    tagVariant: 'warning'
  },

  Completed: {
    name: 'Đã chuyển xong',
    tagVariant: 'success'
  }
}

const ORDER_STATUS_FALLBACK: OrderStatusType = {
  name: '—',
  tagVariant: 'default'
}

/** Tránh crash khi API trả status chưa có trong ORDER_STATUS (giống orderStatusPill bên manager). */
export function getOrderStatusDisplay(status: string | undefined): OrderStatusType {
  const raw = String(status ?? '').trim()
  if (!raw) return ORDER_STATUS_FALLBACK
  const hit = Object.keys(ORDER_STATUS).find((k) => k.toLowerCase() === raw.toLowerCase())
  if (hit) return ORDER_STATUS[hit]
  return { name: raw, tagVariant: 'default' }
}

export function getDeliveryStatusDisplay(status: string | undefined): OrderStatusType {
  const raw = String(status ?? '').trim()
  if (!raw) return ORDER_STATUS_FALLBACK
  const hit = Object.keys(DELIVERY_STATUS).find((k) => k.toLowerCase() === raw.toLowerCase())
  if (hit) return DELIVERY_STATUS[hit]
  return { name: raw, tagVariant: 'default' }
}