import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ShipperMainContent from '@/features/shipper-order/components/ShipperMainContent'

export default function OrderScreen() {
  return (
    <View style={styles.container}>
      <ShipperMainContent/>
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