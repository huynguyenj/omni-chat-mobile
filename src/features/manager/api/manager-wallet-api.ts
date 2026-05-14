import { apiPublic } from '@/configs/axios.config'
import type { ManagerCustomerWalletItem, ManagerWalletPagingQuery, ManagerWalletPagingResponse } from '../types/manager-wallet-type'
import { assertManagerPublicSuccess, unwrapItemsMeta } from '../utils/managerPagedUnwrap'
import { normalizeCustomerWallet } from '../utils/managerWalletNormalize'

const FETCH_PAGE_SIZE = 100

function resolveCustomerProfilePagingPath() {
  const baseUrl = (apiPublic.defaults.baseURL ?? '').toLowerCase()
  if (baseUrl.includes('/api/v1')) return '/customer-profile/paging'
  return '/api/v1/customer-profile/paging'
}

function buildPagingParams(query: ManagerWalletPagingQuery) {
  const pageNumber = Math.max(1, query.pageNumber ?? 1)
  const pageSize = Math.max(1, query.pageSize ?? FETCH_PAGE_SIZE)
  const params: Record<string, unknown> = { pageNumber, pageSize }
  if (query.customerName?.trim()) params.customerName = query.customerName.trim()
  return params
}

export const ManagerWalletApi = {
  getCustomerWalletPaging: async (query: ManagerWalletPagingQuery): Promise<ManagerWalletPagingResponse> => {
    const pageSize = Math.max(1, query.pageSize ?? FETCH_PAGE_SIZE)
    const params = buildPagingParams(query)
    const raw: unknown = await apiPublic.get(resolveCustomerProfilePagingPath(), { params })
    assertManagerPublicSuccess(raw)
    return unwrapItemsMeta(raw, pageSize, normalizeCustomerWallet)
  },

  /**
   * Giống web: lặp trang pageSize 100, không truyền customerName; gộp + dedupe theo id (bản cuối).
   */
  fetchAllCustomerWallets: async (): Promise<ManagerCustomerWalletItem[]> => {
    const byId = new Map<string, ManagerCustomerWalletItem>()
    let page = 1
    while (true) {
      const res = await ManagerWalletApi.getCustomerWalletPaging({
        pageNumber: page,
        pageSize: FETCH_PAGE_SIZE
      })
      for (const item of res.items) {
        if (item.id) byId.set(item.id, item)
      }
      const totalPages = Math.max(1, res.meta.total_pages ?? 1)
      if (page >= totalPages) break
      page += 1
    }
    return Array.from(byId.values())
  }
}
