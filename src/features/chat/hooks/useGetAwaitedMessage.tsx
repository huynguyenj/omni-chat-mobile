import { useEffect, useRef, useState } from 'react'
import * as signalr from '@microsoft/signalr'
import useContextValid from '@/hooks/useContextValid'
import SelectionMessageContext from '../context/ChatProvider'
import { signalrConnection } from '../config/signalr'
import { ResolveMessageType } from '../types/message-type'
import useApiCall from '@/hooks/useApiCall'
import { useAuthStore } from '@/features/auth/store/auth-store'


export default function useGetAwaitedMessage() {
  const [resolveMessageTab, setResolveMessageTab] = useState<ResolveMessageType[]>([])
  const context = useContextValid(SelectionMessageContext)
  const staffId = useAuthStore((s) => s.staffId)
  const connectionRef = useRef<signalr.HubConnection | null>(null)
  const { execute, loading } = useApiCall<ResolveMessageType[]>()
  
  useEffect(() => {
    const fetchResolveMessage = async () => {
      const apiData = await execute({
        apiUrl: `/support-conversations/staff/${staffId}/pending?providerName=${context.providerName}`,
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      setResolveMessageTab(data)
    }
    fetchResolveMessage()
  }, [staffId, context?.providerName])


  //set up signalr
  useEffect(() => {
    const prevConnection = connectionRef.current
    if (prevConnection) {
      prevConnection.off('SidebarUpdated')
      prevConnection.stop()
      connectionRef.current = null
    }
    const newConnection = signalrConnection('supportConversationHub')
    connectionRef.current = newConnection
    if (newConnection) {
      newConnection.start().then(() => {
        console.log('connected')
        newConnection.on('SidebarUpdated', (data: ResolveMessageType) => {
          console.log('Data sidebar: ', data);
          
          setResolveMessageTab(prev => {
            //Get the exited one that in previous awaited array
            const existingIndex = prev.findIndex((m) => m.conversationId === data.conversationId)
            if (existingIndex !=-1) {
              //List contain awaited messages
              const updatedExistingMessages = [...prev]
              //Update the old awaited message existed with new message and date
              updatedExistingMessages[existingIndex] = {
                ...updatedExistingMessages[existingIndex],
                lastMessage: data.lastMessage,
                updateDate: data.updateDate,
                unreadMessageCount: data.unreadMessageCount
              }
              // Get the updated object by splice method
              const [updatedItem] = updatedExistingMessages.splice(existingIndex, 1)
              // Put the updated message to top
              console.log('Updated message: ', updatedItem);
              
              return [updatedItem, ...updatedExistingMessages]
            }
            return [data, ...prev]
          })
        })
      })
        .catch(err => console.log('Signalr connected fail', err))
    }
    return () => {
      newConnection.off('SidebarUpdated')
      newConnection.stop()
      connectionRef.current = null
    }
  }, [context?.providerName])
  
  return { resolveMessageTab }
}
