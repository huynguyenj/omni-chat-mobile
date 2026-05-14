import useApiCall from '@/hooks/useApiCall'
import { PaginationStructure } from '@/types/api.response'
import React, { useEffect, useState } from 'react'
import { ProductBatchAuditItem } from '../types/product-batch-audit-types'
import Toast from 'react-native-toast-message'

export default function useGetProductBatchAudit() {
  const { execute, loading } = useApiCall<PaginationStructure<ProductBatchAuditItem>>()
  const [listBatchAudit, setBatchAudit] = useState<PaginationStructure<ProductBatchAuditItem>>()
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('createDate')
  const [filterAction, setFilterAction] = useState('')
  const [isDescending, setIsDescending] = useState(true)
  const [refreshKey, setRefreshKey] = useState(1)

  useEffect(() => {
      const fetchProductBatchAudit = async () => {
         const params = new URLSearchParams()
         params.append('pageNumber', currentPage.toString())
         params.append('pageSize', '5')
         params.append('descending', String(isDescending))
         if (sortBy) params.append('sortBy', sortBy)
         if (filterAction) params.append('action', filterAction)
         const apiUrl = `/batch-audit/get?${params}`
         const apiData = await execute({
            apiUrl: apiUrl,
            method: 'get',
            type: 'private'
         })
         if (apiData.error) {
            Toast.show({
                  type: 'error',
                  text1: apiData.error
            })
            return
         }
         setBatchAudit(prev => {
            if (currentPage === 1) return apiData.data
            return {
                  ...apiData.data,
                  items: [...(prev?.items || []), ...apiData.data.items]
            }
         })
      }
      fetchProductBatchAudit()
  }, [currentPage, sortBy, isDescending, refreshKey, filterAction])

  const handleRefresh = () => {
      setCurrentPage(1)
      setRefreshKey(prevKey => prevKey + 1)
  }
  const handleSortBy = (value: string) => {
    setCurrentPage(1)
    setSortBy(value)
  }
  const handleSortDescending = () => {
      setCurrentPage(1)
      setIsDescending(prevState => !prevState)
  }
  const handleFilterAction = (value: string) => {
      setCurrentPage(1)
      setFilterAction(value)
  }
  return { listBatchAudit, loading, currentPage, sortBy, isDescending, filterAction, setCurrentPage, handleRefresh, handleSortBy, handleSortDescending, handleFilterAction  }
}
