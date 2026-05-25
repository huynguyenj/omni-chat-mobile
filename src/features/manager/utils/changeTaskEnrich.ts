import { ManagerStaffApi } from '../api/manager-staff-api'
import type { StaffDetailType } from '@/features/staff-manager/types/staff-type'
import type { ManagerChangeTaskClaimItem } from '../types/claim-type'

export async function enrichChangeTaskClaimsWithStaffIntents(
  items: ManagerChangeTaskClaimItem[]
): Promise<ManagerChangeTaskClaimItem[]> {
  const missing = items.filter((c) => c.staffIntentTypes.length === 0 && c.staffId)
  if (missing.length === 0) return items
  const ids = [...new Set(missing.map((c) => c.staffId))]
  const map = await ManagerStaffApi.resolveStaffIntentTypesByStaffIds(ids)
  return items.map((c) =>
    c.staffIntentTypes.length > 0 ? c : { ...c, staffIntentTypes: map.get(c.staffId) ?? [] }
  )
}

export async function enrichStaffDetailsWithIntents(
  staffs: StaffDetailType[]
): Promise<StaffDetailType[]> {
  const missing = staffs.filter((s) => !Array.isArray(s.staffIntentTypes) || s.staffIntentTypes.length === 0)
  if (missing.length === 0) return staffs
  const map = await ManagerStaffApi.resolveStaffIntentTypesByStaffIds(staffs.map((s) => s.id))
  return staffs.map((s) => ({
    ...s,
    staffIntentTypes:
      Array.isArray(s.staffIntentTypes) && s.staffIntentTypes.length > 0
        ? s.staffIntentTypes
        : (map.get(s.id) ?? [])
  }))
}
