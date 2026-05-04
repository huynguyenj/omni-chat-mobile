export function formatTime(dateString: string) {
  const date = new Date(dateString)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatDate(value: string | number | Date): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

export function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function countRestDay (targetDate: Date) {
  const msPerDay = 1000 * 60 * 60 * 24
  const start = new Date()
  const end = new Date(targetDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  const leftDay = Math.ceil((end.getTime() - start.getTime())/ msPerDay)
  return leftDay
}

export const normalizeDate = (date: Date) => {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      return d.toISOString()
}