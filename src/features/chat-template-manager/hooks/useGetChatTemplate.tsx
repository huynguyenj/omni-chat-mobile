import { PaginationStructure } from '@/types/api.response'
import { useEffect, useState } from 'react'
import { ChatTemplateType } from '../types/chat-template-types'
import useApiCall from '@/hooks/useApiCall'

export default function useGetChatTemplate() {
  const { execute, loading } = useApiCall<PaginationStructure<ChatTemplateType>>()
  const [listChatTemplate, setListChatTemplate] = useState<PaginationStructure<ChatTemplateType>>()
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(1)
  useEffect(() => {
    const fetchChatTemplateList = async () => {
      const param = new URLSearchParams()
      param.append('pageNumber', String(currentPage))
      param.append('pageSize', '6')
      if (searchText) param.append('search', searchText)
      const apiUrl = `/chat-templates?${param.toString()}`
      const apiData = await execute({
        apiUrl: apiUrl,
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      if (error) return
      
      setListChatTemplate(prev => {
         if (currentPage === 1) return data
         return {
            ...data,
            items: [...(prev?.items || []), ...data.items]
         }
      })
    }
    fetchChatTemplateList()
  }, [currentPage, searchText, refreshKey])

  const handleRefresh = () => {
    setCurrentPage(1)
    setRefreshKey(prevKey => prevKey + 1)
  }
  return { listChatTemplate, loading, setSearchText, setCurrentPage, handleRefresh, currentPage }
}