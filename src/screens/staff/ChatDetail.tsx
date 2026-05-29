import { View, StyleSheet } from 'react-native'
import React from 'react'
import { RouteProp } from '@react-navigation/native'
import { ChatStackParamList } from '@/navigation/role-navigator/StaffNavigator'
import ChatDetailHeader from '@/features/chat/components/ChatDetailHeader'
import ChatDetailMainPart from '@/features/chat/components/ChatDetailMainPart'
import useGetConversationDetail from '@/features/chat/hooks/useGetConversationDetail'
import LoadingCircle from '@/components/ui/loading/LoadingCircle'

type ChatDetailRouteProp = RouteProp<ChatStackParamList, 'ChatDetail'>

export default function ChatDetail({ route }: { route: ChatDetailRouteProp }) {
  const { id, providerName } = route.params  
  const { conversationDetail, loading } = useGetConversationDetail({ conversationId: id })
  console.log(providerName);
  
  return (
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
                  conversationId={id}
                  activeCustomerId={conversationDetail.activeCustomerId}
                  customerImageUrl={conversationDetail.avartarUrl}
                  customerName={conversationDetail.customerName}
                />
                <ChatDetailMainPart
                  props={{ conversation: conversationDetail, providerName: providerName }}
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
})