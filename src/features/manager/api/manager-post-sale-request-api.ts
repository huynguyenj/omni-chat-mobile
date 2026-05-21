import { apiPublic } from '@/configs/axios.config'
import type { ManagerPostSaleRequestListResponse } from '../types/manager-post-sale-request-type'
import { assertManagerPublicSuccess, unwrapItemsMeta } from '../utils/managerPagedUnwrap'
import { enrichPostSaleRequestsWithOrderInfo, normalizePostSaleRequest } from '../utils/managerPostSaleNormalize'

function resolvePostSaleListPath() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/post-sale-requests/get'
  return '/api/v1/post-sale-requests/get'
}

export const ManagerPostSaleRequestApi = {
  getRequests: async (pageNumber = 1, pageSize = 6): Promise<ManagerPostSaleRequestListResponse> => {
    const params = {
      pageNumber,
      pageSize,
      page: pageNumber,
      pageIndex: pageNumber,
      page_size: pageSize
    }
    const raw: unknown = await apiPublic.get(resolvePostSaleListPath(), { params })
    assertManagerPublicSuccess(raw)
    const { items, meta } = unwrapItemsMeta(raw, pageSize, normalizePostSaleRequest)
    const enriched = await enrichPostSaleRequestsWithOrderInfo(items)
    return { items: enriched, meta }
  }
}
