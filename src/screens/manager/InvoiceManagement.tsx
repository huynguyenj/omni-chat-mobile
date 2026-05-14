import React from 'react'
import { View, StyleSheet } from 'react-native'
import InvoicesManagementScreen from '@/features/manager/components/InvoicesManagementScreen'

export default function InvoiceManagement() {
  return (
    <View style={styles.root}>
      <InvoicesManagementScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 }
})
