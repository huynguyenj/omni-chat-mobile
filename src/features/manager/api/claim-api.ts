import { apiPrivate } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type {
  ManagerChangeTaskClaimListResponse,
  ManagerClaimDashboardData,
  ManagerClaimListResponse
} from '../types/claim-type'
import { extractApiErrorMessage } from '../utils/api-error'

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

function resolveReassignApproveEndpoint(claimId: string, conversationId: string, newStaffId: string) {
  const c = encodeURIComponent(claimId)
  const conv = encodeURIComponent(conversationId)
  const staff = encodeURIComponent(newStaffId)
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/claims/${c}/reassign/${conv}/${staff}/approve`
  return `/api/v1/claims/${c}/reassign/${conv}/${staff}/approve`
}

function resolveChangeTaskRejectEndpoint(claimId: string, managerId: string) {
  const id = encodeURIComponent(claimId)
  const mgr = encodeURIComponent(managerId)
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return `/claims/${id}/reject/${mgr}`
  return `/api/v1/claims/${id}/reject/${mgr}`
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

  approveReassignClaim: async (
    claimId: string,
    conversationId: string,
    newStaffId: string
  ): Promise<string> => {
    if (!claimId) throw new Error('Thiếu claimId để duyệt chuyển giao.')
    if (!conversationId) throw new Error('Thiếu conversationId để duyệt chuyển giao.')
    if (!newStaffId) throw new Error('Thiếu newStaffId để duyệt chuyển giao.')
    const endpoint = resolveReassignApproveEndpoint(claimId, conversationId, newStaffId)
    try {
      const raw: unknown = await apiPrivate.put(endpoint)
      const body = raw as ApiResponseStructure<unknown>
      if (body?.is_success === false) {
        throw new Error(body.reason || body.message || 'Không thể duyệt chuyển giao.')
      }
      return body?.message?.trim() ? body.message : 'Duyệt chuyển giao thành công.'
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'Không thể duyệt chuyển giao.'))
    }
  },

  rejectChangeTaskClaim: async (claimId: string, managerId: string): Promise<string> => {
    if (!claimId) throw new Error('Thiếu claimId để từ chối yêu cầu.')
    if (!managerId) throw new Error('Thiếu managerId để từ chối yêu cầu.')
    const endpoint = resolveChangeTaskRejectEndpoint(claimId, managerId)
    try {
      const raw: unknown = await apiPrivate.put(endpoint)
      const body = raw as ApiResponseStructure<unknown>
      if (body?.is_success === false) {
        throw new Error(body.reason || body.message || 'Không thể từ chối yêu cầu.')
      }
      return body?.message?.trim() ? body.message : 'Đã từ chối yêu cầu chuyển giao.'
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'Không thể từ chối yêu cầu.'))
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
