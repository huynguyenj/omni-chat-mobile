import { apiPrivate } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { ManagerPostSaleRequestListResponse } from '../types/manager-post-sale-request-type'
import { extractApiErrorMessage } from '../utils/api-error'
import { assertManagerPublicSuccess, unwrapItemsMeta } from '../utils/managerPagedUnwrap'
import { enrichPostSaleRequestsWithOrderInfo, normalizePostSaleRequest } from '../utils/managerPostSaleNormalize'
import { logRefund, logRefundError, logRefundListResult } from '../utils/refund-log'

function resolvePostSaleRequestsEndpoint() {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
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
  getRequests: async (
    pageNumber = 1,
    pageSize = 9,
    opts?: { sortBy?: string; descending?: boolean }
  ): Promise<ManagerPostSaleRequestListResponse> => {
    const page = Math.max(1, pageNumber)
    const size = Math.max(1, pageSize)
    const params: Record<string, unknown> = {
      pageNumber: page,
      pageSize: size,
      sortBy: opts?.sortBy?.trim() || 'requestedTime'
    }
    if (typeof opts?.descending === 'boolean') {
      params.descending = opts.descending
    } else {
      params.descending = true
    }
    const path = resolvePostSaleRequestsEndpoint()
    logRefund('API GET list →', { path, params, baseURL: apiPrivate.defaults.baseURL })
    try {
      const raw: unknown = await apiPrivate.get(path, { params })
      const envelope = raw as Partial<ApiResponseStructure<unknown>>
      logRefund('API GET list raw envelope', {
        is_success: envelope?.is_success,
        hasData: !!(envelope as { data?: unknown })?.data
      })
      assertManagerPublicSuccess(raw)
      const { items, meta } = unwrapItemsMeta(raw, size, normalizePostSaleRequest)
      logRefundListResult('API GET list parsed', items, meta)
      const enriched = await enrichPostSaleRequestsWithOrderInfo(items)
      logRefundListResult('API GET list enriched', enriched, meta)
      return { items: enriched, meta }
    } catch (error) {
      logRefundError('API GET list failed', error)
      throw error
    }
  },

  approvePostSaleRequest: async (id: string): Promise<string> => {
    const normalizedId = String(id ?? '').trim()
    if (!normalizedId) throw new Error('Thiếu mã yêu cầu hoàn tiền (PSR id).')
    const path = resolvePostSaleActionPath(normalizedId, 'approve')
    logRefund('API POST approve →', { path, id: normalizedId })
    try {
      const raw: unknown = await apiPrivate.post(path)
      const body = raw as ApiResponseStructure<unknown>
      logRefund('API POST approve ←', { is_success: body?.is_success, message: body?.message })
      if (body?.is_success === false) {
        throw new Error(body.message || 'Không thể duyệt yêu cầu.')
      }
      return body?.message?.trim() ? body.message : 'Đã duyệt yêu cầu.'
    } catch (error) {
      logRefundError('API POST approve failed', error)
      throw new Error(extractApiErrorMessage(error, 'Không thể duyệt yêu cầu.'))
    }
  },

  rejectPostSaleRequest: async (id: string): Promise<string> => {
    const normalizedId = String(id ?? '').trim()
    if (!normalizedId) throw new Error('Thiếu mã yêu cầu hoàn tiền (PSR id).')
    const path = resolvePostSaleActionPath(normalizedId, 'reject')
    logRefund('API POST reject →', { path, id: normalizedId })
    try {
      const raw: unknown = await apiPrivate.post(path)
      const body = raw as ApiResponseStructure<unknown>
      logRefund('API POST reject ←', { is_success: body?.is_success, message: body?.message })
      if (body?.is_success === false) {
        throw new Error(body.message || 'Không thể từ chối yêu cầu.')
      }
      return body?.message?.trim() ? body.message : 'Đã từ chối yêu cầu.'
    } catch (error) {
      logRefundError('API POST reject failed', error)
      throw new Error(extractApiErrorMessage(error, 'Không thể từ chối yêu cầu.'))
    }
  }
}
