import { apiPrivate } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type {
  ManagerChangeTaskClaimListResponse,
  ManagerClaimDashboardData,
  ManagerClaimListResponse
} from '../types/claim-type'

function resolveClaimsEndpoint(mode: 'pending' | 'history') {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/claims/${mode}`
  return `/api/v1/claims/${mode}`
}

function resolveClaimActionEndpoint(id: string, action: 'approve' | 'reject') {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/claims/${id}/${action}`
  return `/api/v1/claims/${id}/${action}`
}

function resolveClaimDashboardEndpoint() {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/claims/dashboard'
  return '/api/v1/claims/dashboard'
}

function resolvePendingChangeTasksEndpoint() {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/claims/pending-change-tasks'
  return '/api/v1/claims/pending-change-tasks'
}

function resolveReassignClaimEndpoint(conversationId: string, newStaffId: string) {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/claims/${conversationId}/reassign/${newStaffId}`
  return `/api/v1/claims/${conversationId}/reassign/${newStaffId}`
}

function extractApiErrorMessage(err: unknown, fallback: string) {
  const e = err && typeof err === 'object' ? (err as Record<string, unknown>) : {}
  const response = e.response && typeof e.response === 'object' ? (e.response as Record<string, unknown>) : {}
  const data = response.data && typeof response.data === 'object' ? (response.data as Record<string, unknown>) : {}
  const innerData = data.data && typeof data.data === 'object' ? (data.data as Record<string, unknown>) : {}

  const reason = String(data.reason ?? '').trim()
  if (reason) return reason
  const exceptionMessage = String(innerData.exceptionMessage ?? '').trim()
  if (exceptionMessage) return exceptionMessage
  const message = String(data.message ?? '').trim()
  if (message) return message
  return fallback
}

function unwrapClaimList(raw: unknown): ManagerClaimListResponse {
  if (!raw || typeof raw !== 'object') {
    return { items: [], meta: { total_pages: 1, total_items: 0, current_page: 1, page_size: 9 } }
  }
  const o = raw as Record<string, unknown>
  if (Array.isArray(o.items) && o.meta && typeof o.meta === 'object') {
    return raw as ManagerClaimListResponse
  }
  if (o.data && typeof o.data === 'object') {
    const d = o.data as Record<string, unknown>
    if (Array.isArray(d.items) && d.meta && typeof d.meta === 'object') {
      return o.data as ManagerClaimListResponse
    }
  }
  const env = raw as ApiResponseStructure<ManagerClaimListResponse>
  if (env && typeof env === 'object' && 'data' in env && env.data && typeof env.data === 'object') {
    return env.data as ManagerClaimListResponse
  }
  return { items: [], meta: { total_pages: 1, total_items: 0, current_page: 1, page_size: 9 } }
}

function unwrapChangeTaskList(raw: unknown, pageSize: number): ManagerChangeTaskClaimListResponse {
  if (!raw || typeof raw !== 'object') {
    return { items: [], meta: { total_pages: 1, total_items: 0, current_page: 1, page_size: pageSize } }
  }
  const payload = raw as ManagerChangeTaskClaimListResponse | ApiResponseStructure<ManagerChangeTaskClaimListResponse> | { data?: ManagerChangeTaskClaimListResponse }
  if ('items' in (payload as ManagerChangeTaskClaimListResponse) && Array.isArray((payload as ManagerChangeTaskClaimListResponse).items)) {
    return payload as ManagerChangeTaskClaimListResponse
  }
  if ((payload as { data?: ManagerChangeTaskClaimListResponse }).data?.items) {
    return (payload as { data: ManagerChangeTaskClaimListResponse }).data
  }
  const env = raw as ApiResponseStructure<ManagerChangeTaskClaimListResponse>
  if (env?.data?.items) return env.data
  return { items: [], meta: { total_pages: 1, total_items: 0, current_page: 1, page_size: pageSize } }
}

const listParams = (page: number, pageSize: number) => ({
  params: { pageIndex: page, pageNumber: page, pageSize, page_size: pageSize }
})

export const ClaimApi = {
  getPendingClaims: async (page = 1, pageSize = 9): Promise<ManagerClaimListResponse> => {
    const raw: unknown = await apiPrivate.get(resolveClaimsEndpoint('pending'), listParams(page, pageSize))
    return unwrapClaimList(raw)
  },

  getHistoryClaims: async (page = 1, pageSize = 9): Promise<ManagerClaimListResponse> => {
    const raw: unknown = await apiPrivate.get(resolveClaimsEndpoint('history'), listParams(page, pageSize))
    return unwrapClaimList(raw)
  },

  getPendingChangeTaskClaims: async (page = 1, pageSize = 10): Promise<ManagerChangeTaskClaimListResponse> => {
    const raw: unknown = await apiPrivate.get(resolvePendingChangeTasksEndpoint(), listParams(page, pageSize))
    return unwrapChangeTaskList(raw, pageSize)
  },

  approveClaim: async (id: string): Promise<void> => {
    await apiPrivate.patch(resolveClaimActionEndpoint(id, 'approve'))
  },

  rejectClaim: async (id: string): Promise<void> => {
    await apiPrivate.patch(resolveClaimActionEndpoint(id, 'reject'))
  },

  reassignClaimConversation: async (conversationId: string, newStaffId: string): Promise<string> => {
    if (!conversationId) throw new Error('Thiếu conversationId để gán lại nhân viên.')
    if (!newStaffId) throw new Error('Thiếu newStaffId để gán lại nhân viên.')
    const endpoint = resolveReassignClaimEndpoint(conversationId, newStaffId)
    try {
      const raw: unknown = await apiPrivate.put(endpoint)
      const body = raw as ApiResponseStructure<unknown>
      if (body && typeof body === 'object' && 'is_success' in body && body.is_success === false) {
        throw new Error(body.reason || body.message || 'Không thể thay nhân viên xử lý.')
      }
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
        return body.message
      }
      return 'Thay nhân viên thành công.'
    } catch (error) {
      const msg = typeof error === 'string' ? error : extractApiErrorMessage(error, 'Không thể thay nhân viên xử lý.')
      throw new Error(msg)
    }
  },

  getDashboard: async (): Promise<ManagerClaimDashboardData> => {
    const raw: unknown = await apiPrivate.get(resolveClaimDashboardEndpoint())
    const rawObj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
    const payload =
      'data' in rawObj && rawObj.data !== undefined && rawObj.data !== null
        ? (rawObj.data as Record<string, unknown> | unknown[])
        : (rawObj as unknown as Record<string, unknown> | unknown[] | undefined)

    if (Array.isArray(payload)) {
      const result: ManagerClaimDashboardData = { total: 0, pending: 0, approved: 0, rejected: 0 }
      payload.forEach((item) => {
        const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
        const status = String(row.status ?? '').toLowerCase()
        const count = Number(row.count ?? 0)
        if (status.includes('pending')) result.pending += count
        else if (status.includes('approve')) result.approved += count
        else if (status.includes('reject')) result.rejected += count
      })
      result.total = result.pending + result.approved + result.rejected
      return result
    }

    const obj = payload && typeof payload === 'object' && !Array.isArray(payload) ? (payload as Record<string, unknown>) : {}
    const pending = Number(obj.pendingClaims ?? obj.pending ?? obj.pendingCount ?? obj.totalPending ?? 0)
    const approved = Number(obj.approvedClaims ?? obj.approved ?? obj.approvedCount ?? obj.totalApproved ?? 0)
    const rejected = Number(obj.rejectedClaims ?? obj.rejected ?? obj.rejectedCount ?? obj.totalRejected ?? 0)
    const total = Number(obj.total ?? obj.totalClaims ?? pending + approved + rejected)
    return { total, pending, approved, rejected }
  }
}
