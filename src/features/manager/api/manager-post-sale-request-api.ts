import { apiPrivate, apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { ManagerPostSaleRequestListResponse } from '../types/manager-post-sale-request-type'
import { extractApiErrorMessage } from '../utils/api-error'
import { assertManagerPublicSuccess, unwrapItemsMeta } from '../utils/managerPagedUnwrap'
import { enrichPostSaleRequestsWithOrderInfo, normalizePostSaleRequest } from '../utils/managerPostSaleNormalize'

function resolvePostSaleListPath() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/post-sale-requests/get'
  return '/api/v1/post-sale-requests/get'
}

function resolvePostSaleActionPath(id: string, action: 'approve' | 'reject') {
  const enc = encodeURIComponent(id)
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/post-sale-requests/${enc}/${action}`
  return `/api/v1/post-sale-requests/${enc}/${action}`
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
  },

  approvePostSaleRequest: async (id: string): Promise<string> => {
    const normalizedId = String(id ?? '').trim()
    if (!normalizedId) throw new Error('Thiếu mã yêu cầu hoàn tiền (PSR id).')
    try {
      const raw: unknown = await apiPrivate.post(resolvePostSaleActionPath(normalizedId, 'approve'))
      const body = raw as ApiResponseStructure<unknown>
      if (body?.is_success === false) {
        throw new Error(body.message || 'Không thể duyệt yêu cầu.')
      }
      return body?.message?.trim() ? body.message : 'Đã duyệt yêu cầu.'
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'Không thể duyệt yêu cầu.'))
    }
  },

  rejectPostSaleRequest: async (id: string): Promise<string> => {
    const normalizedId = String(id ?? '').trim()
    if (!normalizedId) throw new Error('Thiếu mã yêu cầu hoàn tiền (PSR id).')
    try {
      const raw: unknown = await apiPrivate.post(resolvePostSaleActionPath(normalizedId, 'reject'))
      const body = raw as ApiResponseStructure<unknown>
      if (body?.is_success === false) {
        throw new Error(body.message || 'Không thể từ chối yêu cầu.')
      }
      return body?.message?.trim() ? body.message : 'Đã từ chối yêu cầu.'
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'Không thể từ chối yêu cầu.'))
    }
  }
}
