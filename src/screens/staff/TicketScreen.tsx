import { StyleSheet } from 'react-native'
import React from 'react'
import { RouteProp } from '@react-navigation/native'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import CustomStackHeader from '@/components/functional/CustomStackHeader'
import { SafeAreaView } from 'react-native-safe-area-context'
import TicketMainContent from '@/features/ticket/components/TicketMainContent'

type TicketScreenProps = RouteProp<ChatStackParamList, 'TicketScreen'>

export default function TicketScreen({ route }: {route: TicketScreenProps}) {
  const { customerId } = route.params

  return (
    <SafeAreaView style={styles.safeView}>
      <CustomStackHeader title='Lịch sử hỗ trợ'  showBack/>
      <TicketMainContent customerId={customerId}/>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
      safeView: {
            flex: 1,
            backgroundColor: '#F2F4F7'
      }
})
