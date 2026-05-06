import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomStackHeader from '@/components/functional/CustomStackHeader'
import CustomerInfoMainContent from '@/features/customer-info/components/CustomerInfoMainContent'
import { RouteProp } from '@react-navigation/native'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'

type CustomerInfoScreenProps = RouteProp<ChatStackParamList, 'CustomerInfoScreen'>

export default function CustomerInfoScreen({ route }: { route: CustomerInfoScreenProps }) {
  const { conversationId } = route.params
  return (
    <SafeAreaView style={styles.safeView}>
      <CustomStackHeader title='Thông tin chi tiết'  showBack/>
      <CustomerInfoMainContent conversationId={conversationId}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
      safeView: {
            flex: 1,
            backgroundColor: '#F2F4F7'
      }
})
