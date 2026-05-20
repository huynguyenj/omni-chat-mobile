import { useEffect, useRef, useState } from 'react'
import * as signalr from '@microsoft/signalr'
import useContextValid from '@/hooks/useContextValid'
import SelectionMessageContext from '../context/ChatProvider'
import { signalrConnection, signalrSidebarConnection } from '../config/signalr'
import { ResolveMessageType } from '../types/message-type'
import useApiCall from '@/hooks/useApiCall'
import { useAuthStore } from '@/features/auth/store/auth-store'


export default function useGetAwaitedMessage() {
  const [resolveMessageTab, setResolveMessageTab] = useState<ResolveMessageType[]>([])
  const context = useContextValid(SelectionMessageContext)
  const staffId = useAuthStore((s) => s.staffId)
  const accessToken = useAuthStore(s => s.accessToken)
  const connectionRef = useRef<signalr.HubConnection | null>(null)
  const { execute, loading } = useApiCall<ResolveMessageType[]>()
  const [refreshKey, setRefreshKey] = useState(1)
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
  }, [staffId, context?.providerName, refreshKey])


  //set up signalr
  useEffect(() => {
    const prevConnection = connectionRef.current
    if (prevConnection) {
      prevConnection.off('SidebarUpdated')
      prevConnection.stop()
      connectionRef.current = null
    }
    const newConnection = signalrSidebarConnection(context?.providerName ?? '', accessToken ?? '')
    connectionRef.current = newConnection
    if (newConnection) {
      newConnection.start().then(() => {
        console.log('connected')
        newConnection.on('SidebarUpdated', (data: ResolveMessageType[]) => {
          console.log('Data sidebar: ', data);
          setResolveMessageTab(data)
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
  
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1)
  }

  return { resolveMessageTab, handleRefresh, loading }
}
