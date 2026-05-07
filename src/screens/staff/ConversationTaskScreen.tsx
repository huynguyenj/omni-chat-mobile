import { StyleSheet } from 'react-native'
import React from 'react'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import { RouteProp } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ConversationTaskMainContent from '@/features/task/components/ConversationTaskMainContent'
import CustomStackHeader from '@/components/functional/CustomStackHeader'

type ConversationTaskScreenProps = RouteProp<ChatStackParamList, 'ConversationTaskScreen'>

export default function ConversationTaskScreen({ route }: { route: ConversationTaskScreenProps }) {
  const { conversationId } = route.params
  return (
    <SafeAreaView style={styles.safeView}>
      <CustomStackHeader title='Danh sách nhiệm vụ'  showBack/>
      <ConversationTaskMainContent conversationId={conversationId}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
      safeView: {
            flex: 1,
            backgroundColor: '#F2F4F7'
      }
})
