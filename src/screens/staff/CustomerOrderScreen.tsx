import { StyleSheet } from 'react-native'
import React from 'react'
import { RouteProp } from '@react-navigation/native'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomStackHeader from '@/components/functional/CustomStackHeader'
import CustomerOrderMainContent from '@/features/order/components/CustomerOrderMainContent'

type CustomerOrderScreenProps = RouteProp<ChatStackParamList, 'CustomerOrderScreen'>


export default function CustomerOrderScreen({ route }: { route: CustomerOrderScreenProps }) {
  const { customerId } = route.params
  return (
    <SafeAreaView style={styles.safeView}>
      <CustomStackHeader title='Lịch sử đặt đơn của khách'  showBack/>
      <CustomerOrderMainContent customerId={customerId}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
      safeView: {
            flex: 1,
            backgroundColor: '#F2F4F7'
      }
})
