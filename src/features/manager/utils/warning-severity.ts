export type ManagerWarningSeverity = 'high' | 'medium' | 'low'

export type WarningSeverityTheme = {
  label: string
  solidBg: string
  headerTint: string
  titleColor: string
  borderTone: string
}

/** Giống web: NotRespond → cao; loại “ổn định” → thấp; còn lại → trung bình. */
export function warningSeverity(warning: { warningType?: string }): ManagerWarningSeverity {
  const t = String(warning.warningType ?? '')
    .toLowerCase()
    .replace(/_/g, '')
  if (t === 'notrespond' || t.includes('notrespond') || t.includes('staffnotresponding')) return 'high'
  if (
    t.includes('ok') ||
    t.includes('healthy') ||
    t.includes('allclear') ||
    t === 'systemok' ||
    (t.includes('system') && !t.includes('error'))
  ) {
    return 'low'
  }
  return 'medium'
}

export function severityTheme(level: ManagerWarningSeverity): WarningSeverityTheme {
  if (level === 'high') {
    return {
      label: 'Cao',
      solidBg: '#dc2626',
      headerTint: '#fef2f2',
      titleColor: '#991b1b',
      borderTone: '#fecaca'
    }
  }
  if (level === 'medium') {
    return {
      label: 'Trung bình',
      solidBg: '#ea580c',
      headerTint: '#fff7ed',
      titleColor: '#9a3412',
      borderTone: '#fed7aa'
    }
  }
  return {
    label: 'Thấp',
    solidBg: '#16a34a',
    headerTint: '#f0fdf4',
    titleColor: '#166534',
    borderTone: '#bbf7d0'
  }
}

/** Badge chữ trắng trên nền đậm (danh sách + modal). */
export function severityTag(level: ManagerWarningSeverity): { label: string; color: string; bg: string } {
  const t = severityTheme(level)
  return { label: t.label, color: '#fff', bg: t.solidBg }
}
