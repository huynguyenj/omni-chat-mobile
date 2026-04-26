import { PaginationStructure } from '@/types/api.response'
import { useEffect, useState } from 'react'
import { KeywordDetailType } from '../types/keyword-types'
import useApiCall from '@/hooks/useApiCall'

export default function useGetListKeywords() {
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [keyWordList, setKeyWordList] = useState<PaginationStructure<KeywordDetailType>>()
  const [filterIntent, setFilterIntent] = useState('')
  const [sortBy, setSortBy] = useState('createdate')
  const [sortType, setSortType] = useState('true')
  const { execute, loading } = useApiCall<PaginationStructure<KeywordDetailType>>()
  const [refreshKey, setRefreshKey] = useState(1)
  useEffect(() => {
    const fetchKeywordList = async () => {
      const params = new URLSearchParams()
      params.append('pageNumber', currentPage.toString())
      params.append('pageSize', '6')
      params.append('sortBy', sortBy.toString())
      params.append('descending', sortType.toString())
      if (filterIntent || filterIntent !== 'all') params.append('intentTypeId', filterIntent.toString())
      if (searchText) params.append('search', searchText.toString())
      const apiUrl = `/keywords/get?${params.toString()}`
      const apiData = await execute({
        apiUrl: apiUrl,
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      if (error) {
      //   toast.error('Lấy danh sách keywords thất bại')
        return
      }
      setKeyWordList(prev => {
         if (currentPage === 1) return data
         return {
            ...data,
            items: [...(prev?.items || []), ...data.items]
         }
      })
    }
    fetchKeywordList()
  }, [searchText, currentPage, sortType, filterIntent, sortBy, refreshKey])

  const handleSelectIntent = (intentValue: string) => {
    if (intentValue === 'all') {
      setFilterIntent('')
      return
    }
    setFilterIntent(intentValue)
  }

  const handleRefreshKeywordList = async () => {
      setKeyWordList(undefined)
      setSortBy('createdate')
      setSortType('false')
      setSearchText('')
      setCurrentPage(1)
      setRefreshKey(prevKey => prevKey + 1)
  }
  return { setCurrentPage, setSearchText, keyWordList, loading, currentPage, setSortType, sortType, filterIntent, handleSelectIntent, setSortBy, sortBy, handleRefreshKeywordList, searchText }
}