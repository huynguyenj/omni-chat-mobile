/** Khớp backend `WarningType`: StaffNotResponding = 0, SlowPerformance = 1 */
export type ManagerWarningTypeValue = string | number

export type NormalizedWarningType = 'staffNotResponding' | 'slowPerformance' | 'unknown'

export function normalizeWarningType(value: ManagerWarningTypeValue | undefined | null): NormalizedWarningType {
  if (value === 0 || value === '0') return 'staffNotResponding'
  if (value === 1 || value === '1') return 'slowPerformance'
  const lower = String(value ?? '').toLowerCase().replace(/\s+/g, '')
  if (lower.includes('notrespond') || lower === 'staffnotresponding') return 'staffNotResponding'
  if (lower.includes('slowperformance') || (lower.includes('slow') && lower.includes('performance'))) {
    return 'slowPerformance'
  }
  return 'unknown'
}

export function warningSeverityFromType(value: ManagerWarningTypeValue | undefined | null): 'high' | 'medium' {
  return normalizeWarningType(value) === 'staffNotResponding' ? 'high' : 'medium'
}

export function warningTypeLabelVi(value: ManagerWarningTypeValue | undefined | null): string {
  const key = normalizeWarningType(value)
  if (key === 'staffNotResponding') return 'Nhân viên không phản hồi'
  if (key === 'slowPerformance') return 'Hiệu suất chậm'
  if (value === undefined || value === null || value === '') return 'Không xác định'
  return String(value)
}
