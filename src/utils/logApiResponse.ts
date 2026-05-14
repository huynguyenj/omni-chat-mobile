/**
 * Log response API khi debug (Metro / Xcode / Android Studio).
 *
 * Bật: trong `.env` thêm `EXPO_PUBLIC_DEBUG_API=1` rồi `npx expo start -c` (cache clear để env vào bundle).
 * Chỉ chạy khi `__DEV__` — build release không log.
 */
export function shouldLogApiDebug(): boolean {
  return (
    typeof __DEV__ !== 'undefined' &&
    __DEV__ === true &&
    (process.env.EXPO_PUBLIC_DEBUG_API === '1' || process.env.EXPO_PUBLIC_DEBUG_API === 'true')
  )
}

export function logApiResponse(tag: string, detail: Record<string, unknown>, maxChars = 12000) {
  if (!shouldLogApiDebug()) return
  let body: string
  try {
    body = JSON.stringify(detail, null, 2)
  } catch {
    body = String(detail)
  }
  if (body.length > maxChars) {
    body = `${body.slice(0, maxChars)}\n… [truncated ${body.length - maxChars} chars]`
  }
  console.log(`\n========== [API DEBUG] ${tag} ==========\n${body}\n========================================\n`)
}
