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

const LOG_PREFIX = '[Admin/Staff]'

function unwrapRolesFromResponse(response: unknown): RoleItem[] {
  if (Array.isArray(response)) {
    return response.map((item) => {
      const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
      return { id: String(row.id ?? ''), name: String(row.name ?? '') }
    })
  }

  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}

  if (typeof r.is_success === 'boolean') {
    if (!r.is_success) {
      throw new Error(typeof r.message === 'string' ? r.message : 'Không tải được danh sách vai trò')
    }
    if (Array.isArray(r.data)) {
      return unwrapRolesFromResponse(r.data)
    }
  }

  if (Array.isArray(r.data)) return unwrapRolesFromResponse(r.data)
  if (Array.isArray(r.items)) return unwrapRolesFromResponse(r.items)

  throw new Error(typeof r.message === 'string' ? r.message : 'Không tải được danh sách vai trò')
}

export const RolesApi = {
  getRoles: async (): Promise<RoleItem[]> => {
    const endpoint = resolveRolesGetEndpoint()
    console.log(`${LOG_PREFIX} Roles API — request`, { method: 'POST', endpoint, body: {} })

    const axiosRes = await apiPublic.post<ApiResponseStructure<RoleItem[]>>(endpoint, {})
    const raw = axiosRes.data as unknown

    console.log(`${LOG_PREFIX} Roles API — raw response`, raw)

    const list = unwrapRolesFromResponse(raw)
    console.log(`${LOG_PREFIX} Roles API — đã parse`, { tong: list.length })
    console.table(list.map((role, index) => ({ stt: index + 1, id: role.id, ten: role.name })))

    return list
  }
}
