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
  ReturnDefective: {
    name: 'Đã trả hàng do lỗi',
    tagVariant: 'danger'
  }
}

export const DELIVERY_STATUS: Record<string, OrderStatusType> = {
  Pending: {
    name: 'Đang vận chuyển',
    tagVariant: 'default'
  },

  Completed: {
    name: 'Đã chuyển xong',
    tagVariant: 'success'
  }
}