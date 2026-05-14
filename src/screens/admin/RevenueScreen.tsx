import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import AdminDashboardShell from '@/features/admin/components/AdminDashboardShell'
import AdminDashboardHeader from '@/features/admin/components/AdminDashboardHeader'
import RevenueTab from '@/features/admin/components/tabs/RevenueTab'

export default function RevenueScreen() {
  return (
    <AdminDashboardShell>
      <ScrollView contentContainerStyle={styles.content}>
        <AdminDashboardHeader />
        <RevenueTab />
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
