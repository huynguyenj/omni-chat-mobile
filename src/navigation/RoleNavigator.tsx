import React from 'react'
import { useAuthStore } from '../features/auth/store/auth-store'
import AdminNavigator from './AdminNavigator'
import ManagerNavigator from './ManagerNavigator'
import StaffNavigator from './StaffNavigator'
import AuthNavigator from './AuthNavigator'

export default function RoleNavigator() {
  const role = useAuthStore((s) => s.role)
  switch (role) {
      case 'Admin': return <AdminNavigator/>
      case 'Manager': return <ManagerNavigator/>
      case 'Staff': return <StaffNavigator/>
      default: return <AuthNavigator/>
  }
}