import { warningSeverityFromType } from './warning-type-helpers'

export type ManagerWarningSeverity = 'high' | 'medium'

export type WarningSeverityTheme = {
  label: string
  solidBg: string
  headerTint: string
  titleColor: string
  borderTone: string
}

/** Chỉ high | medium — theo `warningSeverityFromType`. */
export function warningSeverity(warning: { warningType?: string | number }): ManagerWarningSeverity {
  return warningSeverityFromType(warning.warningType)
}

export function severityTheme(level: ManagerWarningSeverity): WarningSeverityTheme {
  if (level === 'high') {
    return {
      label: 'Nghiêm trọng',
      solidBg: '#dc2626',
      headerTint: '#fef2f2',
      titleColor: '#991b1b',
      borderTone: '#fecaca'
    }
  }
  return {
    label: 'Cảnh báo',
    solidBg: '#ea580c',
    headerTint: '#fff7ed',
    titleColor: '#9a3412',
    borderTone: '#fed7aa'
  }
}

/** Badge chữ trắng trên nền đậm (danh sách + modal). */
export function severityTag(level: ManagerWarningSeverity): { label: string; color: string; bg: string } {
  const t = severityTheme(level)
  return { label: t.label, color: '#fff', bg: t.solidBg }
}
