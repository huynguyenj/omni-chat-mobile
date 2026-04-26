import React from 'react'
import { useAuthStore } from '../../features/auth/store/auth-store'
import AdminNavigator from '../role-navigator/AdminNavigator'
import ManagerNavigator from '../role-navigator/ManagerNavigator'
import StaffNavigator from '../role-navigator/StaffNavigator'
import AuthNavigator from '../AuthNavigator'
import ShipperNavigator from '../role-navigator/ShipperNavigator'

export default function RoleNavigator() {
  const role = useAuthStore((s) => s.role)
  switch (role) {
      case 'Admin': return <AdminNavigator/>
      case 'Manager': return <ManagerNavigator/>
      case 'Staff': return <StaffNavigator/>
      case 'Shipper': return <ShipperNavigator/>
      default: return <AuthNavigator/>
  }
}