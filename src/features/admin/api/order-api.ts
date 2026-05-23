import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { AdminOrderDetail, OrderDashboardMonthRow, OrderListResponse } from '../types/order-type'

export const OrderApi = {
  getOrders: async (page = 1, pageSize = 20): Promise<ApiResponseStructure<OrderListResponse>> => {
    const response = await apiPublic.get<ApiResponseStructure<OrderListResponse>>(
      `/orders/get?page=${page}&pageSize=${pageSize}`
    )
    return response.data as unknown as ApiResponseStructure<OrderListResponse>
  },

  getOrderById: async (id: string): Promise<ApiResponseStructure<AdminOrderDetail>> => {
    const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
    const path = baseUrl.includes('/api/v1')
      ? `/orders/get/${encodeURIComponent(id)}`
      : `/api/v1/orders/get/${encodeURIComponent(id)}`
    const response = await apiPublic.get<ApiResponseStructure<AdminOrderDetail>>(path)
    return response.data as unknown as ApiResponseStructure<AdminOrderDetail>
  },

  getOrderDashboard: async (input: string): Promise<ApiResponseStructure<OrderDashboardMonthRow[]>> => {
    const params = { input }
    const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
    const endpoint = baseUrl.includes('/api/v1') ? '/orders/dashboard' : '/api/v1/orders/dashboard'
    const response = await apiPublic.get<ApiResponseStructure<OrderDashboardMonthRow[]>>(endpoint, { params })
    return response.data as unknown as ApiResponseStructure<OrderDashboardMonthRow[]>
  }
}
