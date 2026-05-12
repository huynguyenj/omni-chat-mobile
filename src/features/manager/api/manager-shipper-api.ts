import { apiPublic } from '@/configs/axios.config'
import type { ManagerShipperListQuery, ManagerShipperListResponse } from '../types/shipper-type'
import { assertManagerPublicSuccess, unwrapItemsMeta } from '../utils/managerPagedUnwrap'
import { normalizeShipper } from '../utils/managerShipperNormalize'

function resolveShippersBasePath() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/shippers'
  return '/api/v1/shippers'
}

export const ManagerShipperApi = {
  getShippers: async (query: ManagerShipperListQuery): Promise<ManagerShipperListResponse> => {
    const pageIndex = Math.max(1, query.pageIndex)
    const pageSize = Math.max(1, query.pageSize)
    const params = {
      pageIndex,
      pageSize,
      pageNumber: pageIndex,
      page_number: pageIndex,
      page_size: pageSize
    }
    const raw: unknown = await apiPublic.get(resolveShippersBasePath(), { params })
    assertManagerPublicSuccess(raw)
    const { items, meta } = unwrapItemsMeta(raw, pageSize, normalizeShipper)
    return { items, meta }
  },

  assignOrderToShipper: async (shipperId: string, orderId: string): Promise<void> => {
    if (!shipperId) throw new Error('Thiếu shipper.')
    if (!orderId) throw new Error('Thiếu đơn hàng.')
    const base = resolveShippersBasePath().replace(/\/$/, '')
    const endpoint = `${base}/${encodeURIComponent(shipperId)}/assign-order`
    const raw: unknown = await apiPublic.post(endpoint, null, { params: { orderId } })
    assertManagerPublicSuccess(raw)
  }
}
