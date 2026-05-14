import { useCallback, useMemo, useState, type PropsWithChildren } from 'react'
import {
  AdminDashboardContext,
  type AdminDashboardContextValue,
  type AdminDashboardTab,
  type RevenueSortBy,
  type SortOrder,
  type StaffAccount
} from './AdminDashboardContext'

export function AdminDashboardProvider({ children }: PropsWithChildren) {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const [dateFrom, setDateFrom] = useState<Date | undefined>(firstDay)
  const [dateTo, setDateTo] = useState<Date | undefined>(today)
  const setSafeDateFrom = useCallback(
    (d: Date | undefined) => {
      if (d && dateTo && d > dateTo) return
      setDateFrom(d)
    },
    [dateTo]
  )

  const setSafeDateTo = useCallback(
    (d: Date | undefined) => {
      if (d && dateFrom && d < dateFrom) return
      setDateTo(d)
    },
    [dateFrom]
  )
  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('overview')
  const [addStaffDialogOpen, setAddStaffDialogOpen] = useState(false)
  const [editStaffDialogOpen, setEditStaffDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null)
  const [sortBy, setSortBy] = useState<RevenueSortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const toggleSort = useCallback((column: RevenueSortBy) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(column)
    setSortOrder('desc')
  }, [sortBy])

  const value = useMemo<AdminDashboardContextValue>(() => {
    return {
      dateFrom,
      dateTo,
      setDateFrom: setSafeDateFrom,
      setDateTo: setSafeDateTo,
      activeTab,
      setActiveTab,
      addStaffDialogOpen,
      setAddStaffDialogOpen,
      editStaffDialogOpen,
      setEditStaffDialogOpen,
      selectedStaff,
      setSelectedStaff,
      sortBy,
      sortOrder,
      toggleSort
    }
  }, [
    activeTab,
    addStaffDialogOpen,
    dateFrom,
    dateTo,
    editStaffDialogOpen,
    selectedStaff,
    sortBy,
    sortOrder,
    setSafeDateFrom,
    setSafeDateTo,
    toggleSort
  ])

  return <AdminDashboardContext.Provider value={value}>{children}</AdminDashboardContext.Provider>
}
