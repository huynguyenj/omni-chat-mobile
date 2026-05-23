import React from 'react'
import BottomTabNavigator from '../custom-tab/BottomTabNavigator'
import { adminTabs } from '../role-route'
import { AdminDashboardProvider } from '@/features/admin/context/AdminDashboardProvider'

export default function AdminNavigator() {
  return (
    <AdminDashboardProvider>
      <BottomTabNavigator routeList={adminTabs} />
    </AdminDashboardProvider>
  )
}