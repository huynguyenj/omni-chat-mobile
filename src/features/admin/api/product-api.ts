import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'
import type { ProductListResponse } from '../types/product-type'

export const ProductApi = {
  getAllProducts: async (page = 1, pageSize = 10): Promise<ApiResponseStructure<ProductListResponse>> => {
    const response = await apiPublic.get<ApiResponseStructure<ProductListResponse>>(
      `/products/get?page=${page}&pageSize=${pageSize}`
    )
    return response.data
  }
}
