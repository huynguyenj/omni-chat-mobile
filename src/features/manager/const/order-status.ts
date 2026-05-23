import { ORDER_STATUS, getOrderStatusUi, resolveOrderStatusKey } from '@/features/order/const/order-status'

export type ManagerOrderStatusFilter =
  | 'Draft'
  | 'Pending'
  | 'Cancelled'
  | 'Shipped'
  | 'PendingReturn'
  | 'Returned'
  | 'Completed'
  | 'ReturnedDefective'
  | 'ReturnRejected'
  | 'RefundRejected'
  | 'RefundApproved'
  | 'ReturnApproved'

/** Giá trị gửi query `orderStatuses` — khớp enum BE. */
export const MANAGER_ORDER_STATUS_FILTER_VALUES: ManagerOrderStatusFilter[] = [
  'Draft',
  'Pending',
  'Cancelled',
  'Shipped',
  'PendingReturn',
  'Returned',
  'Completed',
  'ReturnedDefective',
  'ReturnRejected',
  'RefundRejected',
  'RefundApproved',
  'ReturnApproved'
]

export const MANAGER_ORDER_STATUS_FILTERS: Array<{ value: 'all' | ManagerOrderStatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  ...MANAGER_ORDER_STATUS_FILTER_VALUES.map((value) => ({
    value,
    label: ORDER_STATUS[value]?.name ?? value
  }))
]

export { resolveOrderStatusKey, getOrderStatusUi }

/** Pill cho RN — label + màu chữ/nền. */
export function getOrderStatusPill(status: string): { label: string; color: string; bg: string } {
  const ui = getOrderStatusUi(status)
  return { label: ui.labelVi, color: '#fff', bg: ui.pillBg }
}
