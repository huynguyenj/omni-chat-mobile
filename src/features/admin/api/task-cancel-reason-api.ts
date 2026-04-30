import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { TaskCancelReasonListResponse } from '../types/task-cancel-reason-type'

export const TaskCancelReasonApi = {
  getPaging: async (page = 1, pageSize = 10): Promise<ApiResponseStructure<TaskCancelReasonListResponse>> => {
    const params = { page, pageSize }
    const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
    const endpoint = baseUrl.includes('/api/v1') ? '/task-cancel-reasons/paging' : '/api/v1/task-cancel-reasons/paging'
    const response = await apiPublic.get<ApiResponseStructure<TaskCancelReasonListResponse>>(endpoint, { params })
    return response.data
  }
}
