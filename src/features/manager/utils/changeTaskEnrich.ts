import { ManagerStaffApi } from '../api/manager-staff-api'
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
