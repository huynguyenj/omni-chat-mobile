import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { ManagerWarningDetailResponse, ManagerWarningListResponse } from '../types/warning-type'
import { unwrapWarningDetail, unwrapWarningList } from '../utils/warningsNormalize'

function resolveListEndpoint() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/conversation-warnings/get'
  return '/api/v1/conversation-warnings/get'
}

function resolveDetailEndpoint(id: string) {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/conversation-warnings/${encodeURIComponent(id)}/warning`
  return `/api/v1/conversation-warnings/${encodeURIComponent(id)}/warning`
}

function assertEnvelopeSuccess(raw: unknown) {
  if (!raw || typeof raw !== 'object') return
  const o = raw as Partial<ApiResponseStructure<unknown>>
  if ('is_success' in o && o.is_success === false) {
    throw new Error(String(o.reason || o.message || 'Không tải được dữ liệu.'))
  }
}

const listParams = (page: number, pageSize: number, isReviewed?: boolean) => {
  const params: Record<string, unknown> = {
    page,
    pageSize,
    pageNumber: page,
    pageIndex: page,
    page_size: pageSize
  }
  if (typeof isReviewed === 'boolean') params.isReviewed = isReviewed
  return { params }
}

export const WarningApi = {
  getWarnings: async (page = 1, pageSize = 10, isReviewed?: boolean): Promise<ManagerWarningListResponse> => {
    const raw: unknown = await apiPublic.get(resolveListEndpoint(), listParams(page, pageSize, isReviewed))
    assertEnvelopeSuccess(raw)
    return unwrapWarningList(raw, pageSize)
  },

  getWarningDetail: async (id: string): Promise<ManagerWarningDetailResponse> => {
    const raw: unknown = await apiPublic.get(resolveDetailEndpoint(id))
    assertEnvelopeSuccess(raw)
    const detail = unwrapWarningDetail(raw)
    if (!detail || !detail.id) throw new Error('Không có dữ liệu chi tiết.')
    return detail
  }
}
