import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import AdminDashboardShell from '@/features/admin/components/AdminDashboardShell'
import AdminDashboardHeader from '@/features/admin/components/AdminDashboardHeader'
import StaffTab from '@/features/admin/components/tabs/StaffTab'

export default function ManageStaffScreen() {
  return (
    <AdminDashboardShell>
      <ScrollView contentContainerStyle={styles.content}>
        <AdminDashboardHeader />
        <StaffTab />
      </ScrollView>
    </AdminDashboardShell>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12
  }
})
