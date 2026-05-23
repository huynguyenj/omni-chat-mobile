import { apiPublic } from '@/configs/axios.config'
import { logApiResponse } from '@/utils/logApiResponse'
import type { ManagerShipperListQuery, ManagerShipperListResponse } from '../types/shipper-type'
import { assertManagerPublicSuccess, unwrapItemsMeta } from '../utils/managerPagedUnwrap'
import { normalizeShipper } from '../utils/managerShipperNormalize'

function resolveShippersBasePath() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/shippers'
  return '/api/v1/shippers'
}

function assertShipperDataPresent(root: Record<string, unknown>) {
  if ('data' in root && root.data == null) {
    throw new Error(String(root.reason || root.message || 'Không có dữ liệu shipper.'))
  }
}

/**
 * Sau interceptor: `{ is_success, data: { items, meta } }`.
 */
function unwrapShipperListEnvelope(raw: unknown, pageSize: number): ManagerShipperListResponse {
  assertManagerPublicSuccess(raw)
  if (!raw || typeof raw !== 'object') throw new Error('Phản hồi shipper không hợp lệ.')
  const root = raw as Record<string, unknown>
  assertShipperDataPresent(root)
  const data = root.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const d = data as Record<string, unknown>
    if (Array.isArray(d.items)) {
      const meta = (d.meta && typeof d.meta === 'object' ? d.meta : {}) as Record<string, unknown>
      const items = (d.items as unknown[]).map(normalizeShipper)
      return {
        items,
        meta: {
          total_pages: Number(meta.total_pages ?? meta.totalPages ?? 1),
          total_items: Number(meta.total_items ?? meta.totalItems ?? items.length),
          current_page: Number(meta.current_page ?? meta.currentPage ?? meta.pageIndex ?? 1),
          page_size: Number(meta.page_size ?? meta.pageSize ?? pageSize)
        }
      }
    }
  }
  return unwrapItemsMeta(raw, pageSize, normalizeShipper)
}

export const ManagerShipperApi = {
  /**
   * GET — chỉ query **pageIndex** + **pageSize** (không pageNumber).
   */
  getShippers: async (query: ManagerShipperListQuery): Promise<ManagerShipperListResponse> => {
    const pageIndex = Math.max(1, query.pageIndex)
    const pageSize = Math.max(1, query.pageSize)
    const params = { pageIndex, pageSize }
    const path = resolveShippersBasePath()
    const raw: unknown = await apiPublic.get(path, { params })
    const result = unwrapShipperListEnvelope(raw, pageSize)
    logApiResponse('ManagerShipperApi.getShippers', {
      baseURL: apiPublic.defaults.baseURL,
      path,
      query: params,
      rawAfterInterceptor: raw,
      normalizedItemCount: result.items.length,
      normalizedPreview: result.items.slice(0, 3),
      meta: result.meta
    })
    return result
  },

  /** POST body null, orderId trong query string. */
  assignOrderToShipper: async (shipperId: string, orderId: string): Promise<void> => {
    if (!shipperId) throw new Error('Thiếu shipper.')
    if (!orderId) throw new Error('Thiếu đơn hàng.')
    const base = resolveShippersBasePath().replace(/\/$/, '')
    const endpoint = `${base}/${encodeURIComponent(shipperId)}/assign-order`
    const raw: unknown = await apiPublic.post(endpoint, null, { params: { orderId } })
    assertManagerPublicSuccess(raw)
  }
}
