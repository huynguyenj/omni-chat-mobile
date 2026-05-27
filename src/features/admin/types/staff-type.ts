export type StaffIntentType = {
  intentTypeName: string
}

export type StaffStatus = 'Online' | 'Offline' | 'Busy' | string

export type StaffItem = {
  id: string
  name: string
  email: string
  phone: string
  status: StaffStatus
  roleName: string
  staffIntentTypes: StaffIntentType[]
}

export type StaffPaginationMeta = {
  total_pages: number
  total_items: number
  current_page: number
  page_size: number
}

export type StaffListResponse = {
  items: StaffItem[]
  meta: StaffPaginationMeta
}
