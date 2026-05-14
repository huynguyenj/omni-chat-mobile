/** Mirrors loose API envelopes used by admin endpoints (web parity). */

export function isApiSuccessLike(response: unknown): boolean {
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  if (typeof r.is_success === 'boolean') return r.is_success
  if (typeof r.isSuccess === 'boolean') return r.isSuccess
  return Number(r.status_code ?? r.statusCode ?? 0) === 200
}

export function extractArrayFromResponse(response: unknown): unknown[] {
  if (Array.isArray(response)) return response
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  if (Array.isArray(r.items)) return r.items
  if (Array.isArray(r.data)) return r.data
  const data = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : {}
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.data)) return data.data
  return []
}

export function extractProductTotalPages(response: unknown): number {
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  const data = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : {}
  const nestedData = data.data && typeof data.data === 'object' ? (data.data as Record<string, unknown>) : {}
  const metaCandidates = [
    data.meta,
    data.pagination,
    data.pageInfo,
    nestedData.meta,
    nestedData.pagination,
    nestedData.pageInfo,
    r.meta,
    r.pagination,
    r.pageInfo
  ]

  for (const meta of metaCandidates) {
    if (meta && typeof meta === 'object') {
      const m = meta as Record<string, unknown>
      const total = Number(m.total_pages ?? m.totalPages ?? 1)
      if (Number.isFinite(total) && total > 0) return total
    }
  }

  return 1
}

export function extractProductTotalItems(response: unknown): number {
  const r = response && typeof response === 'object' ? (response as Record<string, unknown>) : {}
  const data = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : {}
  const nestedData = data.data && typeof data.data === 'object' ? (data.data as Record<string, unknown>) : {}
  const metaCandidates = [
    data.meta,
    data.pagination,
    data.pageInfo,
    nestedData.meta,
    nestedData.pagination,
    nestedData.pageInfo,
    r.meta,
    r.pagination,
    r.pageInfo
  ]

  for (const meta of metaCandidates) {
    if (meta && typeof meta === 'object') {
      const m = meta as Record<string, unknown>
      const total = Number(m.total_items ?? m.totalItems ?? 0)
      if (Number.isFinite(total) && total >= 0) return total
    }
  }

  return 0
}

export function normalizeCancelReasonMeta(raw: unknown): {
  total_pages: number
  total_items: number
  current_page: number
  page_size: number
} {
  const m = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    total_pages: Number(m.total_pages ?? m.totalPages ?? 0),
    total_items: Number(m.total_items ?? m.totalItems ?? 0),
    current_page: Number(m.current_page ?? m.currentPage ?? 1),
    page_size: Number(m.page_size ?? m.pageSize ?? 10)
  }
}
