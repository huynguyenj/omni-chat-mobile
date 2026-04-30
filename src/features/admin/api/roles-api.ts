import { apiPublic } from '@/configs/axios.config'
import type { ApiResponseStructure } from '@/types/api.response'

export type RoleItem = {
  id: string
  name: string
}

function resolveRolesGetEndpoint() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/roles/get'
  return '/api/v1/roles/get'
}

export const RolesApi = {
  getRoles: async (): Promise<RoleItem[]> => {
    const body = (await apiPublic.post<ApiResponseStructure<RoleItem[]>>(resolveRolesGetEndpoint(), {}))
      .data as unknown as ApiResponseStructure<RoleItem[]>
    if (body.is_success === false || !Array.isArray(body.data)) {
      throw new Error(body.message || 'Không tải được danh sách vai trò')
    }
    return body.data
  }
}
