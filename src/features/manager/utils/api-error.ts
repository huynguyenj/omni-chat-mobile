/** Trích message lỗi từ axios response (manager APIs). */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  const e = err && typeof err === 'object' ? (err as Record<string, unknown>) : {}
  const response = e.response && typeof e.response === 'object' ? (e.response as Record<string, unknown>) : {}
  const data = response.data && typeof response.data === 'object' ? (response.data as Record<string, unknown>) : {}
  const innerData = data.data && typeof data.data === 'object' ? (data.data as Record<string, unknown>) : {}

  const reason = String(data.reason ?? '').trim()
  if (reason) return reason
  const exceptionMessage = String(innerData.exceptionMessage ?? '').trim()
  if (exceptionMessage) return exceptionMessage
  const message = String(data.message ?? '').trim()
  if (message) return message
  if (typeof err === 'string' && err.trim()) return err.trim()
  return fallback
}
