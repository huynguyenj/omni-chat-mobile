import { View, Text } from 'react-native'
import React from 'react'
import { useAuthStore } from '../features/auth/store/auth-store'
import AdminNavigator from './AdminNavigator'
import ManagerNavigator from './ManagerNavigator'
import StaffNavigator from './StaffNavigator'
import AuthNavigator from './AuthNavigator'

export default function RoleNavigator() {
  const role = useAuthStore((s) => s.role)
  switch (role) {
      case 'admin': return <AdminNavigator/>
      case 'manager': return <ManagerNavigator/>
      case 'staff': return <StaffNavigator/>
      default: return <AuthNavigator/>
  }
}