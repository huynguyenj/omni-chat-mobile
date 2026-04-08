import React, { useEffect, useState } from 'react'
import { ConversationDetail } from '../types/message-type'
import useApiCall from '@/hooks/useApiCall'

export default function useGetConversationDetail({ conversationId= null }: { conversationId: string |null }) {
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail>()
  const { execute, loading } = useApiCall<ConversationDetail>()
  const getConversationDetailById = async () => {
      if (!conversationId) return
      const apiData = await execute({
            apiUrl: `/support-conversations/${conversationId}`,
            method: 'get',
            type: 'private'
      })
      
      const { data, error } = apiData
      setConversationDetail(data)
      
  }
  useEffect(() => {
      getConversationDetailById()
  }, [conversationId])
  return { conversationDetail, loading }
}
