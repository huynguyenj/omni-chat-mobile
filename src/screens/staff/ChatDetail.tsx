import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { NavigationProp, useNavigation, RouteProp } from '@react-navigation/native'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import Input from '@/components/ui/inputs/Input'
import Button from '@/components/ui/buttons/Button'
import { Send } from 'lucide-react-native'
import ChatDetailHeader from '@/features/chat/components/ChatDetailHeader'
import ChatDetailMainPart from '@/features/chat/components/ChatDetailMainPart'
import { ChatProvider } from '@/features/chat/context/ChatProvider'
import useGetConversationDetail from '@/features/chat/hooks/useGetConversationDetail'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

type ChatDetailRouteProp = RouteProp<ChatStackParamList, 'ChatDetail'>

export default function ChatDetail({ route }: { route: ChatDetailRouteProp }) {
  const { id } = route.params  
  const { conversationDetail, loading } = useGetConversationDetail({ conversationId: id })
  return (
    <ChatProvider>
        <View style={styles.container}>
          { loading ?
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <LoadingCircle size={40}/>
            </View>
            :
            <>
              { conversationDetail ?
              <>
                <ChatDetailHeader
                  customerImageUrl={conversationDetail.avartarUrl}
                  customerName={conversationDetail.customerName}
                />
                <ChatDetailMainPart
                  props={{ conversation: conversationDetail }}
                />
              </>
              :
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingCircle size={40}/>
                </View>
              }
            </>
          }
       </View>
    </ChatProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
})