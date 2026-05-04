import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import OrderHistoryContent from '@/features/shipper-order/components/OrderHistoryContent'

export default function OrderHistoryOrder() {
  return (
    <View style={styles.container}>
      <OrderHistoryContent/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10
  },
})