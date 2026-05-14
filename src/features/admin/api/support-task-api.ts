import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { TaskIntentMonthRow } from '../types/support-task-type'

export const SupportTaskApi = {
  getTaskIntentDashboard: async (period: string): Promise<ApiResponseStructure<TaskIntentMonthRow[]>> => {
    const params = { period }
    const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
    const endpoint = baseUrl.includes('/api/v1') ? '/support-task/dashboard' : '/api/v1/support-task/dashboard'
    const response = await apiPublic.get<ApiResponseStructure<TaskIntentMonthRow[]>>(endpoint, { params })
    return response.data
  }
}
