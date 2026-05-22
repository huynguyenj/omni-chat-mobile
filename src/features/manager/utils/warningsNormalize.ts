import type { ManagerWarningItem, ManagerWarningListResponse, ManagerWarningDetailResponse } from '../types/warning-type'

function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1'
  if (typeof v === 'number') return v !== 0
  return false
}

export function normalizeWarningItem(raw: unknown): ManagerWarningItem {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const id = String(o.id ?? o.warningId ?? o.warning_id ?? '')
  const conversationId = String(o.conversationId ?? o.conversation_id ?? o.conversationID ?? '')
  const warningTypeRaw = o.warningType ?? o.warning_type ?? o.type ?? ''
  const warningType =
    typeof warningTypeRaw === 'number' ? warningTypeRaw : String(warningTypeRaw ?? '')
  const isReviewed = toBool(o.isReviewed ?? o.is_reviewed ?? o.reviewed)
  const createdAt = String(o.createAt ?? o.createdAt ?? o.created_at ?? o.submitDate ?? o.date ?? '')
  const staffName = String(o.staffName ?? o.staff_name ?? 'Chưa rõ')
  const customerName = String(o.customerName ?? o.customer_name ?? 'Chưa rõ')
  const reason = String(
    o.reason ?? o.preview ?? o.message ?? o.description ?? o.content ?? o.note ?? 'Không có mô tả'
  )
  const title = String(o.title ?? o.name ?? o.subject ?? o.warningTypeName ?? 'Cảnh báo')
  const preview = reason
  return {
    id,
    conversationId,
    warningType,
    isReviewed,
    createdAt,
    staffName,
    customerName,
    reason,
    title,
    preview
  }
}

export function normalizeWarningDetail(raw: unknown): ManagerWarningDetailResponse {
  const base = normalizeWarningItem(raw)
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const description = o.description != null ? String(o.description) : undefined
  const conversationTitle =
    o.conversationTitle != null
      ? String(o.conversationTitle)
      : o.conversation_title != null
        ? String(o.conversation_title)
        : undefined
  const staffName = o.staffName != null ? String(o.staffName) : o.staff_name != null ? String(o.staff_name) : undefined
  const customerName =
    o.customerName != null ? String(o.customerName) : o.customer_name != null ? String(o.customer_name) : undefined
  const known = new Set([
    'id',
    'warningId',
    'warning_id',
    'conversationId',
    'conversation_id',
    'warningType',
    'warning_type',
    'type',
    'isReviewed',
    'is_reviewed',
    'reviewed',
    'createdAt',
    'created_at',
    'title',
    'name',
    'subject',
    'preview',
    'warningTypeName',
    'warning_type_name',
    'conversationTitle',
    'conversation_title',
    'staffName',
    'staff_name',
    'customerName',
    'customer_name',
    'message',
    'description',
    'content',
    'reason',
    'note'
  ])
  const extra: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) {
    if (!known.has(k)) extra[k] = v
  }
  const detail: ManagerWarningDetailResponse = {
    ...base,
    staffName: staffName ?? base.staffName,
    customerName: customerName ?? base.customerName,
    reason: description ?? base.reason,
    description: description ?? base.reason,
    preview: description ?? base.reason,
    conversationTitle
  }
  if (Object.keys(extra).length) detail.extra = extra
  return detail
}

function emptyList(pageSize: number): ManagerWarningListResponse {
  return {
    items: [],
    meta: { total_pages: 1, total_items: 0, current_page: 1, page_size: pageSize }
  }
}

export function unwrapWarningList(raw: unknown, pageSize: number): ManagerWarningListResponse {
  if (!raw || typeof raw !== 'object') return emptyList(pageSize)
  const r = raw as Record<string, unknown>

  const inner = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : null
  if (Array.isArray(r.data)) {
    const arr = r.data as unknown[]
    const items = arr.map(normalizeWarningItem)
    return {
      items,
      meta: {
        total_pages: 1,
        total_items: items.length,
        current_page: 1,
        page_size: pageSize
      }
    }
  }
  const payload = inner && Array.isArray(inner.items) ? inner : r

  if (!Array.isArray((payload as Record<string, unknown>).items)) {
    if (Array.isArray(r.items)) {
      const items = (r.items as unknown[]).map(normalizeWarningItem)
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
    return emptyList(pageSize)
  }

  const p = payload as Record<string, unknown>
  const items = ((p.items as unknown[]) ?? []).map(normalizeWarningItem)
  const meta = (p.meta as Record<string, unknown>) || {}
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

export function unwrapWarningDetail(raw: unknown): ManagerWarningDetailResponse | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const inner = r.data && typeof r.data === 'object' ? r.data : raw
  return normalizeWarningDetail(inner)
}
