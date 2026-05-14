import { apiPublic } from '@/configs/axios.config'
import type { ManagerOrderDetail, ManagerOrderListQuery, ManagerOrderListResponse } from '../types/manager-order-type'
import { assertManagerPublicSuccess, unwrapEnvelopeData, unwrapItemsMeta } from '../utils/managerPagedUnwrap'
import { normalizeOrder, normalizeOrderDetail } from '../utils/managerOrdersNormalize'

function resolveOrdersGetPath() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/orders/get'
  return '/api/v1/orders/get'
}

function resolveOrderByIdPath(id: string) {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/orders/get/${encodeURIComponent(id)}`
  return `/api/v1/orders/get/${encodeURIComponent(id)}`
}

function resolveOrderCancelPath(id: string) {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/orders/${encodeURIComponent(id)}/cancel`
  return `/api/v1/orders/${encodeURIComponent(id)}/cancel`
}

function resolveSubmitDraftPath() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/orders/submit-draft'
  return '/api/v1/orders/submit-draft'
}

function buildOrderListParams(query: ManagerOrderListQuery) {
  const pageNumber = Math.max(1, query.pageNumber ?? query.page ?? query.pageIndex ?? 1)
  const pageSize = Math.max(1, query.pageSize ?? 10)
  const sortBy = query.sortBy?.trim() || 'orderdate'
  const descending = query.descending !== false

  const params: Record<string, unknown> = {
    pageNumber,
    pageSize,
    page: pageNumber,
    pageIndex: pageNumber,
    page_size: pageSize,
    sortBy,
    descending
  }
  if (query.search?.trim()) params.search = query.search.trim()
  if (query.orderStatuses?.length) params.orderStatuses = query.orderStatuses
  return params
}

function serializeOrderParams(params: Record<string, unknown>) {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v == null || v === '') return
    if (Array.isArray(v)) {
      v.forEach((item) => usp.append(k, String(item)))
    } else if (typeof v === 'boolean') {
      usp.append(k, v ? 'true' : 'false')
    } else {
      usp.append(k, String(v))
    }
  })
  return usp.toString()
}

export const ManagerOrderApi = {
  getOrders: async (query: ManagerOrderListQuery): Promise<ManagerOrderListResponse> => {
    const pageSize = Math.max(1, query.pageSize ?? 10)
    const params = buildOrderListParams(query)
    const raw: unknown = await apiPublic.get(resolveOrdersGetPath(), {
      params,
      paramsSerializer: (p) => serializeOrderParams(p as Record<string, unknown>)
    })
    assertManagerPublicSuccess(raw)
    return unwrapItemsMeta(raw, pageSize, normalizeOrder)
  },

  getOrderById: async (id: string): Promise<ManagerOrderDetail> => {
    const raw: unknown = await apiPublic.get(resolveOrderByIdPath(id))
    assertManagerPublicSuccess(raw)
    const data = unwrapEnvelopeData<unknown>(raw) ?? raw
    const detail = normalizeOrderDetail(data)
    if (!detail.id) throw new Error('Không có dữ liệu đơn hàng.')
    return detail
  },

  submitDraftOrder: async (orderId: string): Promise<void> => {
    if (!orderId) throw new Error('Thiếu mã đơn.')
    const raw: unknown = await apiPublic.post(resolveSubmitDraftPath(), { orderId })
    assertManagerPublicSuccess(raw)
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    if (!orderId) throw new Error('Thiếu mã đơn.')
    const raw: unknown = await apiPublic.patch(resolveOrderCancelPath(orderId), {})
    assertManagerPublicSuccess(raw)
  }
}
