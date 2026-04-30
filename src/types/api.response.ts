export type ApiResponseStructure<T> = {
  status_code: number
  message: string
  reason: string
  is_success: boolean
  data: T
}