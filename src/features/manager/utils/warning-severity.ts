export type ManagerWarningSeverity = 'high' | 'medium'

/** Giống logic web: NotRespond → mức cao, còn lại → trung bình. */
export function warningSeverity(warning: { warningType?: string }): ManagerWarningSeverity {
  const t = String(warning.warningType ?? '')
    .toLowerCase()
    .replace(/_/g, '')
  if (t === 'notrespond' || t.includes('notrespond')) return 'high'
  return 'medium'
}

export function severityTag(level: ManagerWarningSeverity): { label: string; color: string; bg: string } {
  if (level === 'high') return { label: 'Cao', color: '#b91c1c', bg: '#fee2e2' }
  return { label: 'Trung bình', color: '#b45309', bg: '#fef3c7' }
}
