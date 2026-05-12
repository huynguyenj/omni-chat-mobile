import type { ApiResponseStructure } from '@/types/api.response'

export function assertManagerPublicSuccess(raw: unknown) {
  if (!raw || typeof raw !== 'object') return
  const o = raw as Partial<ApiResponseStructure<unknown>>
  if ('is_success' in o && o.is_success === false) {
    throw new Error(String(o.reason || o.message || 'Lỗi API'))
  }
}

export function unwrapItemsMeta<T>(
  raw: unknown,
  pageSize: number,
  normalize: (x: unknown) => T
): { items: T[]; meta: { total_pages: number; total_items: number; current_page: number; page_size: number } } {
  const emptyMeta = { total_pages: 1, total_items: 0, current_page: 1, page_size: pageSize }
  if (!raw || typeof raw !== 'object') return { items: [], meta: emptyMeta }
  const r = raw as Record<string, unknown>

  if (Array.isArray(r.data)) {
    const arr = r.data as unknown[]
    return {
      items: arr.map(normalize),
      meta: { ...emptyMeta, total_items: arr.length, current_page: 1 }
    }
  }

  let payload: Record<string, unknown> = r
  if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) {
    const d = r.data as Record<string, unknown>
    if (Array.isArray(d.items)) payload = d
  }

  if (!Array.isArray(payload.items)) {
    if (Array.isArray(r.items)) {
      const items = (r.items as unknown[]).map(normalize)
      const meta = (r.meta as Record<string, unknown>) || {}
      return {
        items,
        meta: {
          total_pages: Number(meta.total_pages ?? meta.totalPages ?? 1),
          total_items: Number(meta.total_items ?? meta.totalItems ?? items.length),
          current_page: Number(meta.current_page ?? meta.currentPage ?? 1),
          page_size: Number(meta.page_size ?? meta.pageSize ?? pageSize)
        }
      }
    }
    return { items: [], meta: emptyMeta }
  }

  const items = (payload.items as unknown[]).map(normalize)
  const meta = (payload.meta as Record<string, unknown>) || {}
  return {
    items,
    meta: {
      total_pages: Number(meta.total_pages ?? meta.totalPages ?? 1),
      total_items: Number(meta.total_items ?? meta.totalItems ?? items.length),
      current_page: Number(meta.current_page ?? meta.currentPage ?? 1),
      page_size: Number(meta.page_size ?? meta.pageSize ?? pageSize)
    }
  }
}

export function unwrapEnvelopeData<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if ('data' in r && r.data != null && typeof r.data === 'object') return r.data as T
  return raw as T
}
