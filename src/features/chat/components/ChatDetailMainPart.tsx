import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/buttons/Button'
import Input from '@/components/ui/inputs/Input'
import { Annoyed, Send } from 'lucide-react-native'
import { ConversationDetail, MessageType, SenderMessage } from '../types/message-type'
import useConnectChatTwoWay from '../hooks/useConnectChatTwoWay'
import { useAuthStore } from '@/features/auth/store/auth-store'
import useContextValid from '@/hooks/useContextValid'
import SelectionMessageContext from '../context/ChatProvider'

type ChatDetailMainPartProp = {
      conversation: ConversationDetail
}

export default function ChatDetailMainPart({ props }: { props: ChatDetailMainPartProp }) {
  const staffId = useAuthStore((s) => s.staffId)
  
  const { providerName } = useContextValid(SelectionMessageContext)
  const { connectionRef, messages, setMessages } = useConnectChatTwoWay({ conversationId: props.conversation.id, conversationMessages: props.conversation.messages })
  const flatListRef = useRef<FlatList>(null)
  const [text, setText] = useState('')

  const handleSendMessage = async () => {
      
      setText('')
      if (!staffId) return
      const connection = connectionRef.current
      if (!connection) return

      if (text) {
         try {
            const newMessage: MessageType = {
                  content: text,
                  senderId: staffId,
                  senderType: 'Staff',
                  timestamp: new Date().getTime()
            }
            const finalMessageSending: SenderMessage = {
                  Content: text,
                  StaffId: staffId,
                  SupportConversationId: props.conversation.id
            }
            setMessages((prevMessages) => [...prevMessages, newMessage])
            await connection.invoke('StaffSendMessage', providerName, finalMessageSending)
         } catch (error) {
            console.log('Sending message error', error);            
         }
            
      }
      
  }

//   useEffect(() => {
//       flatListRef.current?.scrollToEnd({ animated: true })
//   }, [messages])
  return (
      <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}>
            <View style={styles.chatMessageContainer}>
                     <>
                        { messages.length > 0 ? 
                              <FlatList
                                    ref={flatListRef}
                                    data={messages}
                                    extraData={messages}
                                    keyExtractor={(_, index) => index.toString()}
                                    contentContainerStyle={{ padding: 10 }}
                                    onContentSizeChange={() =>
                                          flatListRef.current?.scrollToEnd({ animated: true })
                                    }
                                    renderItem={({ item }) => {
                                          const isMe = item.senderType === 'Staff'
                                          return (
                                                <View
                                                style={[
                                                      styles.messageWrapper,
                                                      isMe ? styles.messageRight : styles.messageLeft,
                                                ]}
                                                >
                                                <View
                                                      style={[
                                                      styles.messageBubble,
                                                      isMe ? styles.bubbleRight : styles.bubbleLeft,
                                                      ]}
                                                >
                                                      <Text style={isMe ? styles.messageTextRight : styles.messageTextLeft}>{item.content}</Text>
                                                </View>
                                                </View>
                                          )
                                    }}
                              />
                        :
                              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Annoyed color={'#ACB0B3'} size={40} strokeWidth={2.5}/>
                                    <Text style={styles.blankText}>Chưa có tin nhắn</Text>
                              </View>
                        }
                     </>   
            </View>
            <View style={styles.inputContainer}>
            <Input
                  placeholder='Tin nhắn...'
                  style={styles.input}
                  onChangeText={setText}
                  value={text}
            />
            <Button
                  icon={{
                        iconDirection: 'right',
                        iconName: Send
                  }}
                  style={styles.btn}
                  onPress={handleSendMessage}
            />
            </View>
      </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#F2F4F7'
  },
  chatMessageContainer: {
    flex: 0.85,
    paddingHorizontal: 10,
    paddingVertical: 12
  },
  inputContainer: {
    flex: 0.15,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    height: 50,
    width: 320
  },
  btn: {
    width: 50,
    height: 50,
    borderRadius: '100%'
  },
  messageWrapper: {
    marginVertical: 4,
    flexDirection: 'row',
  },

  messageLeft: {
    justifyContent: 'flex-start',
  },

  messageRight: {
    justifyContent: 'flex-end',
  },

  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
  },

  bubbleLeft: {
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 0,
  },

  bubbleRight: {
    backgroundColor: '#003366',
    borderTopRightRadius: 0,
  },

  messageTextLeft: {
    color: '#000000',
  },
  messageTextRight: {
    color: '#ffffff'
  },

  blankText: {
    color: '#ACB0B3',
    fontWeight: 600,
    fontSize: 14,
    marginVertical: 15
  }
})