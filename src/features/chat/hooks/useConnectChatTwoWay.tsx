import React, { useEffect, useRef, useState } from 'react'
import * as signalr from '@microsoft/signalr'
import { signalrConnection } from '../config/signalr'
import { MessageType } from '../types/message-type'

type UseConnectChatTwoWayProp = {
      conversationId: string,
      conversationMessages: MessageType[]
}

export default function useConnectChatTwoWay({ conversationId, conversationMessages }: UseConnectChatTwoWayProp) {
  const connectionRef = useRef<signalr.HubConnection | null>(null)
  const [messages, setMessages]  = useState<MessageType[]>(conversationMessages|| [])
  
  useEffect(() => {
      if (!conversationId) return
      const prevConnection = connectionRef.current
      if (prevConnection) {
            prevConnection.off('CustomerReceiveMessage')
            prevConnection.stop()
            connectionRef.current = null
      }
      const newConnection = signalrConnection('supportConversationHub')
      connectionRef.current = newConnection
      
      const startConnection = async () => {
            try {
              console.log('Start connection');
              
              newConnection.on('CustomerReceiveMessage', (message: MessageType) => {
                 console.log('New message: ', message);
                 
                 setMessages((prevMessages) => [...prevMessages, message])
              })
              await newConnection.start()
              console.log('SignalR connected', newConnection.state)
              await newConnection.invoke('JoinConversationGroup', conversationId.toString())
              console.log('Joined conversation group', conversationId.toString())
            } catch (error) {
               console.log('Signalr error joining group:', error)
            }
      }
      startConnection()
      return () => {
            newConnection.off('CustomerReceiveMessage')
            newConnection.stop()
            connectionRef.current = null
      }
  }, [conversationId])

 
  
  return { connectionRef, setMessages, messages }
}
