import type { StaffIntentType } from '@/features/staff-manager/types/staff-type'

export type ManagerClaimStatus = 'pending' | 'approved' | 'rejected'

export type ManagerClaimItem = {
  id: string
  staff: string
  type: string
  submitDate: string
  description: string
  reason: string
  status: ManagerClaimStatus
}

export type ManagerClaimListResponse = {
  items: ManagerClaimItem[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}

export type ManagerClaimDashboardData = {
  total: number
  pending: number
  approved: number
  rejected: number
}

export type ManagerChangeTaskClaimItem = {
  id: string
  description: string
  reason: string
  submitDate: string
  status: string
  staffId: string
  staffName: string
  conversationId: string
  staffIntentTypes: StaffIntentType[]
  claimTypeId: string
  claimTypeName: string
}

export type ManagerChangeTaskClaimListResponse = {
  items: ManagerChangeTaskClaimItem[]
  meta: {
    total_pages: number
    total_items: number
    current_page: number
    page_size: number
  }
}
