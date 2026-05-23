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

export const StaffApi = {
  getStaffs: async (page = 1, pageSize = 20): Promise<ApiResponseStructure<StaffListResponse>> => {
    const response = await apiPublic.get<ApiResponseStructure<StaffListResponse>>(
      `/staff/get?page=${page}&pageSize=${pageSize}`
    )
    return response.data
  },
  createStaff: async (payload: CreateStaffPayload): Promise<ApiResponseStructure<unknown>> => {
    const response = await apiPublic.post<ApiResponseStructure<unknown>>('/staff/create', payload)
    return response.data
  },
  updateStaff: async (id: string, payload: UpdateStaffPayload): Promise<ApiResponseStructure<unknown>> => {
    const response = await apiPublic.put<ApiResponseStructure<unknown>>(`/staff/update/${id}`, payload)
    return response.data
  },
  deleteStaff: async (id: string): Promise<ApiResponseStructure<unknown>> => {
    const response = await apiPublic.delete<ApiResponseStructure<unknown>>(`/staff/delete/${id}`)
    return response.data
  }
}
