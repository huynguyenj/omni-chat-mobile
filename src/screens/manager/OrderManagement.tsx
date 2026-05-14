import React from 'react'
import { View } from 'react-native'
import OrdersManagementScreen from '@/features/manager/components/OrdersManagementScreen'

export default function OrderManagement() {
  return (
    <View style={{ flex: 1 }}>
      <OrdersManagementScreen />
    </View>
  )
}
