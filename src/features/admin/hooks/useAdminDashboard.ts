import { useContext } from 'react'
import { AdminDashboardContext } from '../context/AdminDashboardContext'

export function useAdminDashboard() {
  const ctx = useContext(AdminDashboardContext)
  if (!ctx) throw new Error('useAdminDashboard must be used within AdminDashboardProvider')
  return ctx
}
