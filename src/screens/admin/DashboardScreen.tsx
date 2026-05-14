import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import AdminDashboardShell from '@/features/admin/components/AdminDashboardShell'
import AdminDashboardHeader from '@/features/admin/components/AdminDashboardHeader'
import OverviewTab from '@/features/admin/components/tabs/OverviewTab'

export default function DashboardScreen() {
  return (
    <AdminDashboardShell>
      <ScrollView contentContainerStyle={styles.content}>
        <AdminDashboardHeader />
        <OverviewTab />
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
