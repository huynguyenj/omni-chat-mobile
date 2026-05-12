import React from 'react'
import { View, StyleSheet } from 'react-native'
import WalletManagementScreen from '@/features/manager/components/WalletManagementScreen'

export default function WalletManagement() {
  return (
    <View style={styles.root}>
      <WalletManagementScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 }
})
