import type { StaffIntentType } from '@/features/staff-manager/types/staff-type'
import type {
  ManagerChangeTaskClaimItem,
  ManagerClaimItem,
  ManagerClaimStatus
} from '../types/claim-type'

export function toClaimStatus(raw: unknown, mode: 'pending' | 'history'): ManagerClaimStatus {
  const value = String(raw ?? '').toLowerCase()
  if (value.includes('approve')) return 'approved'
  if (value.includes('reject')) return 'rejected'
  return mode === 'pending' ? 'pending' : 'approved'
}

export function normalizeClaim(raw: unknown, mode: 'pending' | 'history'): ManagerClaimItem {
  const item = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const description = String(
    item.description ?? item.claimName ?? item.name ?? item.title ?? item.note ?? 'Không có mô tả'
  )
  return {
    id: String(item.id ?? item.claimId ?? ''),
    staff: String(item.staff ?? item.staffName ?? item.createdBy ?? description ?? 'Chưa rõ'),
    type: String(item.type ?? item.claimType ?? item.category ?? 'Claim'),
    submitDate: String(item.submitDate ?? item.createdAt ?? item.startDate ?? item.startAt ?? '-'),
    description,
    reason: String(item.reason ?? item.note ?? item.description ?? 'Không có lý do'),
    status: toClaimStatus(item.status ?? item.claimStatus, mode)
  }
}

function parseStaffIntentTypesFromClaim(raw: unknown): StaffIntentType[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      const o = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {}
      const id = String(o.id ?? '')
      const intentTypeName = String(o.intentTypeName ?? o.intent_type_name ?? o.typeName ?? '')
      if (!id && !intentTypeName) return null
      return { id: id || intentTypeName, intentTypeName: intentTypeName || id }
    })
    .filter((x): x is StaffIntentType => x != null)
}

export function normalizeChangeTaskClaim(raw: unknown): ManagerChangeTaskClaimItem {
  const item = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    id: String(item.id ?? ''),
    description: String(item.description ?? 'Không có mô tả'),
    reason: String(item.reason ?? 'Không có lý do'),
    submitDate: String(item.submitDate ?? item.createdAt ?? '-'),
    status: String(item.status ?? 'Pending'),
    staffId: String(item.staffId ?? item.staff_id ?? ''),
    staffName: String(item.staffName ?? item.staff ?? 'Chưa rõ'),
    conversationId: String(item.conversationId ?? item.conversation_id ?? ''),
    staffIntentTypes: parseStaffIntentTypesFromClaim(item.staffIntentTypes ?? item.staff_intent_types),
    claimTypeId: String(item.claimTypeId ?? item.claim_type_id ?? ''),
    claimTypeName: String(item.claimTypeName ?? item.claimType ?? 'CHANGETASK')
  }
}

export function formatDateTime(rawDate: string) {
  if (!rawDate) return '—'
  const d = new Date(rawDate)
  if (Number.isNaN(d.getTime())) return rawDate
  const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date} ${time}`
}
