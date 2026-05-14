import { apiPrivate } from '@/configs/axios.config'
import type { ApiResponseStructure, PaginationStructure } from '@/types/api.response'
import type { StaffDetailType, StaffIntentType } from '@/features/staff-manager/types/staff-type'

function resolveStaffGetEndpoint() {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/staff/get'
  return '/api/v1/staff/get'
}

export type ManagerStaffListQuery = {
  departmentIds?: string[]
  search?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  descending?: boolean
}

export type ManagerIntentType = {
  id: string
  typeName: string
  description: string
}

function resolveIntentTypesEndpoint() {
  const baseUrl = (apiPrivate.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/intent-type/gets'
  return '/api/v1/intent-type/gets'
}

function unwrapEnvelope<T>(raw: unknown): ApiResponseStructure<T> {
  if (!raw || typeof raw !== 'object') throw new Error('Phản hồi API không hợp lệ')
  return raw as ApiResponseStructure<T>
}

export const ManagerStaffApi = {
  getStaffs: async (
    query: ManagerStaffListQuery = {}
  ): Promise<ApiResponseStructure<PaginationStructure<StaffDetailType>>> => {
    const { departmentIds, search, pageNumber = 1, pageSize = 20, sortBy, descending = false } = query
    const endpoint = resolveStaffGetEndpoint()
    const params: Record<string, unknown> = { pageNumber, pageSize, descending }
    if (search?.trim()) params.search = search.trim()
    if (sortBy) params.sortBy = sortBy
    if (departmentIds?.length) params.departmentIds = departmentIds

    const raw = await apiPrivate.get<unknown>(endpoint, { params })
    return unwrapEnvelope<PaginationStructure<StaffDetailType>>(raw)
  },

  getIntentTypes: async (): Promise<ApiResponseStructure<ManagerIntentType[]>> => {
    const raw = await apiPrivate.get<unknown>(resolveIntentTypesEndpoint())
    return unwrapEnvelope<ManagerIntentType[]>(raw)
  },

  resolveStaffIntentTypesByStaffIds: async (staffIds: string[]) => {
    const want = new Set(staffIds.filter((id) => id && String(id).trim() !== ''))
    const map = new Map<string, StaffIntentType[]>()
    if (want.size === 0) return map

    let page = 1
    let totalPages = 1
    const pageSize = 100

    while (map.size < want.size && page <= totalPages && page <= 30) {
      const res = await ManagerStaffApi.getStaffs({ pageNumber: page, pageSize, descending: false })
      if (res.is_success === false || res.data == null) break
      const items = Array.isArray(res.data.items) ? res.data.items : []
      for (const s of items) {
        if (want.has(s.id)) {
          map.set(s.id, Array.isArray(s.staffIntentTypes) ? s.staffIntentTypes : [])
        }
      }
      totalPages = Math.max(1, Number(res.data.meta?.total_pages ?? 1))
      page += 1
      if (items.length === 0) break
    }

    return map
  }
}
