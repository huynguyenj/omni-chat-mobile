import { ClaimApi } from '../api/claim-api'
import type { ManagerClaimItem } from '../types/claim-type'
import { normalizeClaim } from './claimsNormalize'

export const CLAIMS_ALL_SOURCE_LIMIT = 200

function claimSubmitTimeMs(c: ManagerClaimItem): number {
  const t = new Date(c.submitDate).getTime()
  return Number.isNaN(t) ? 0 : t
}

/** Gộp pending + history, sắp xếp mới nhất trước, phân trang client. */
export async function fetchMergedClaimsPageSlice(
  pageIndex: number,
  pageSize: number
): Promise<{ items: ManagerClaimItem[]; total: number }> {
  const [pRes, hRes] = await Promise.all([
    ClaimApi.getPendingClaims(1, CLAIMS_ALL_SOURCE_LIMIT),
    ClaimApi.getHistoryClaims(1, CLAIMS_ALL_SOURCE_LIMIT)
  ])
  const pendingItems = (Array.isArray(pRes?.items) ? pRes.items : []).map((item) => normalizeClaim(item, 'pending'))
  const historyItems = (Array.isArray(hRes?.items) ? hRes.items : []).map((item) => normalizeClaim(item, 'history'))
  const byId = new Map<string, ManagerClaimItem>()
  for (const c of pendingItems) {
    if (c.id) byId.set(c.id, c)
  }
  for (const c of historyItems) {
    if (c.id) byId.set(c.id, c)
  }
  const merged = [...byId.values()].sort((a, b) => claimSubmitTimeMs(b) - claimSubmitTimeMs(a))
  const total = merged.length
  const start = (pageIndex - 1) * pageSize
  const items = merged.slice(start, start + pageSize)
  return { items, total }
}
