import { useEffect, useRef, useState } from 'react'
import { type TotalConversationNav } from '../types/message-type'
import { useAuthStore } from '@/features/auth/store/auth-store'
import * as signalr from '@microsoft/signalr'
import { signalrConnection } from '../config/signalr'
import useApiCall from '@/hooks/useApiCall'

export default function useGetTotalConversation() {
  const [totalConversation, setTotalConversation] = useState<TotalConversationNav[]>()
  const staffId = useAuthStore(s => s.staffId)
  const connectionRef = useRef<signalr.HubConnection | null>(null)
  const { execute, loading } = useApiCall<TotalConversationNav[]>()
  useEffect(() => {
    const fetchResolveMessage = async () => {
      if (!staffId) {
        return
      }
      const apiData = await execute({
        apiUrl: `/support-conversations/staff/${staffId}/count-pending`,
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      if (error) {
        return
      }
      setTotalConversation(data)
    }
    fetchResolveMessage()
  }, [staffId])
  useEffect(() => {
    const prevConnection = connectionRef.current
    if (prevConnection) {
      prevConnection.off('UpdatePendingCount')
      prevConnection.stop()
      connectionRef.current = null
    }
    const newConnection = signalrConnection('SidebarHub')
    connectionRef.current = newConnection
    const connect = async () => {
      if (newConnection) {
        try {
          await newConnection.start()
          newConnection.on('UpdatePendingCount', (data: TotalConversationNav[]) => {
            console.log('Total conversation connected')
            setTotalConversation(data)
          })
        } catch (error) {
          console.log('Signalr total conversation fail', error)
        }
      }
    }
      connect()
      return () => {
        newConnection.off('UpdatePendingCount')
        newConnection.stop()
        connectionRef.current = null
      }
  }, [])
  return { totalConversation, loading }
}
