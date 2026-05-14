import { createContext } from 'react'

export type AdminDashboardTab = 'overview' | 'revenue' | 'staff'
export type RevenueSortBy = 'date' | 'value' | 'customer'
export type SortOrder = 'asc' | 'desc'

export type StaffAccount = {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  department: string
  status: string
  joinDate: string
}

export type AdminDashboardContextValue = {
  dateFrom: Date | undefined
  dateTo: Date | undefined
  setDateFrom: (d: Date | undefined) => void
  setDateTo: (d: Date | undefined) => void

  activeTab: AdminDashboardTab
  setActiveTab: (t: AdminDashboardTab) => void

  addStaffDialogOpen: boolean
  setAddStaffDialogOpen: (open: boolean) => void

  editStaffDialogOpen: boolean
  setEditStaffDialogOpen: (open: boolean) => void
  selectedStaff: StaffAccount | null
  setSelectedStaff: (s: StaffAccount | null) => void

  sortBy: RevenueSortBy
  sortOrder: SortOrder
  toggleSort: (column: RevenueSortBy) => void
}

export const AdminDashboardContext = createContext<AdminDashboardContextValue | undefined>(undefined)
