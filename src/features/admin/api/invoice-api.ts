import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { TotalRevenue } from '../types/invoice-type'

export const InvoiceApi = {
  getTotalRevenue: async (input: string): Promise<ApiResponseStructure<TotalRevenue[]>> => {
    const params = { period: input }
    const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
    const endpoint = baseUrl.includes('/api/v1') ? '/invoices/total-revenue' : '/api/v1/invoices/total-revenue'
    const response = await apiPublic.get<ApiResponseStructure<TotalRevenue[]>>(endpoint, { params })
    return response.data
  },

  getTotalUnpaid: async (input: string): Promise<ApiResponseStructure<TotalRevenue[]>> => {
    const params = { period: input }
    const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
    const endpoint = baseUrl.includes('/api/v1') ? '/invoices/total-unpaid' : '/api/v1/invoices/total-unpaid'
    const response = await apiPublic.get<ApiResponseStructure<TotalRevenue[]>>(endpoint, { params })
    return response.data
  }
}
