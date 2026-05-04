import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { RouteProp } from '@react-navigation/native'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OrderProvider } from '@/features/order/context/OrderProvider'
import OrderMainContent from '@/features/order/components/OrderMainContent'

type OrderScreenRouteProp = RouteProp<ChatStackParamList, 'OrderSectionScreen'>


export default function OrderSectionScreen({ route }: { route: OrderScreenRouteProp }) {
  const { customerId } = route.params
  return (
    <OrderProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <OrderMainContent/>
        </View>
      </SafeAreaView>
    </OrderProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F4F7'
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F2F4F7'
  }
})