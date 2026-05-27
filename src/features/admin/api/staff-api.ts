import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { StaffListResponse } from '../types/staff-type'

type StaffIntentPayload = {
  intentId: string
}

type CreateStaffPayload = {
  name: string
  email: string
  phone: string
  roleId: string
  staffIntentTypes: StaffIntentPayload[]
}

type UpdateStaffPayload = {
  name: string
  email: string
  phone: string
  staffIntentTypes: StaffIntentPayload[]
}

export type StaffListQuery = {
  departmentIds?: string[]
  search?: string
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  descending?: boolean
}

function resolveStaffGetAdminEndpoint() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/staff/get/admin'
  return '/api/v1/staff/get/admin'
}

function serializeStaffListParams(inputParams: Record<string, unknown>): string {
  const query = new URLSearchParams()
  Object.entries(inputParams).forEach(([key, value]) => {
    if (value == null) return
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, String(entry)))
      return
    }
    query.append(key, String(value))
  })
  return query.toString()
}

export const StaffApi = {
  getStaffs: async (query: StaffListQuery = {}): Promise<StaffListResponse> => {
    const {
      departmentIds,
      search,
      pageNumber = 1,
      pageSize = 20,
      sortBy,
      descending = false
    } = query

    const endpoint = resolveStaffGetAdminEndpoint()
    const params: Record<string, unknown> = { pageNumber, pageSize, descending }
    if (search?.trim()) params.search = search.trim()
    if (sortBy) params.sortBy = sortBy
    if (departmentIds?.length) params.departmentIds = departmentIds

    const response = (await apiPublic.get<ApiResponseStructure<StaffListResponse>>(endpoint, {
      params,
      paramsSerializer: serializeStaffListParams
    })) as unknown as ApiResponseStructure<StaffListResponse>

    if (response.is_success === false || response.data == null) {
      throw new Error(response.message || 'Không tải được danh sách nhân viên.')
    }
    return response.data
  },
  createStaff: async (payload: CreateStaffPayload): Promise<ApiResponseStructure<unknown>> => {
    return (await apiPublic.post<ApiResponseStructure<unknown>>('/staff/create', payload)) as unknown as ApiResponseStructure<unknown>
  },
  updateStaff: async (id: string, payload: UpdateStaffPayload): Promise<ApiResponseStructure<unknown>> => {
    return (await apiPublic.put<ApiResponseStructure<unknown>>(`/staff/update/${id}`, payload)) as unknown as ApiResponseStructure<unknown>
  },
  deleteStaff: async (id: string): Promise<ApiResponseStructure<unknown>> => {
    return (await apiPublic.delete<ApiResponseStructure<unknown>>(`/staff/delete/${id}`)) as unknown as ApiResponseStructure<unknown>
  }
}
