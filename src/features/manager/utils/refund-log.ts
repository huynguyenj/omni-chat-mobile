const TAG = '[Refund/PSR]'

function summarizePsrItem(item: {
  id?: string
  status?: string
  type?: string
  orderId?: string
  refundAmount?: number
  requestedTime?: string
  customerName?: string
}) {
  return {
    id: item.id,
    status: item.status,
    type: item.type,
    orderId: item.orderId,
    refundAmount: item.refundAmount,
    requestedTime: item.requestedTime,
    customerName: item.customerName
  }
}

/** Log debug refund/post-sale — chỉ bật khi `__DEV__`. */
export function logRefund(step: string, payload?: unknown) {
  if (!__DEV__) return
  if (payload !== undefined) {
    console.log(TAG, step, payload)
  } else {
    console.log(TAG, step)
  }
}

export function logRefundWarn(step: string, payload?: unknown) {
  if (!__DEV__) return
  if (payload !== undefined) {
    console.warn(TAG, step, payload)
  } else {
    console.warn(TAG, step)
  }
}

export function logRefundError(step: string, error: unknown) {
  if (!__DEV__) return
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error)
  console.warn(TAG, step, message, error)
}

export function logRefundListResult(
  step: string,
  items: Array<{
    id?: string
    status?: string
    type?: string
    orderId?: string
    refundAmount?: number
    requestedTime?: string
    customerName?: string
  }>,
  meta?: { total_pages?: number; current_page?: number; total_items?: number; page_size?: number }
) {
  if (!__DEV__) return
  logRefund(step, {
    count: items.length,
    meta,
    statusBreakdown: items.reduce<Record<string, number>>((acc, it) => {
      const k = String(it.status ?? 'unknown')
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    }, {}),
    sample: items.slice(0, 3).map(summarizePsrItem)
  })
}
