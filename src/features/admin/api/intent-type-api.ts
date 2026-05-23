import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'

export type IntentTypeItem = {
  id: string
  typeName: string
  description: string
}

function resolveIntentTypesEndpoint() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/intent-type/gets'
  return '/api/v1/intent-type/gets'
}

export const IntentTypeApi = {
  getIntentTypes: async (): Promise<IntentTypeItem[]> => {
    const body = (await apiPublic.get<ApiResponseStructure<IntentTypeItem[]>>(
      resolveIntentTypesEndpoint()
    )) as unknown as ApiResponseStructure<IntentTypeItem[]>
    if (body.is_success === false || !Array.isArray(body.data)) {
      throw new Error(body.message || 'Không tải được danh sách loại intent')
    }
    return body.data
  }
}
