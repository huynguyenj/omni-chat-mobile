import { useEffect, useState } from 'react'
import type { BatchType } from '../types/batch-type'
import useApiCall from '@/hooks/useApiCall'
import { PaginationStructure } from '@/types/api.response'

export default function useGetListBatchByProductId({ productId }: { productId?: string }) {
  const { execute, loading } = useApiCall<PaginationStructure<BatchType>>()
  const [listBatch, setListBatch] = useState<PaginationStructure<BatchType>>()
  const [newFilter, setNewFilter] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(1)

  useEffect(() => {
    if (!productId) return
    const fetchBatchList = async () => {
      const apiData = await execute({
        apiUrl: `/products/${productId}/batches?pageNumber=${currentPage}&pageSize=5&isNewest=${newFilter}`,
        method: 'get',
        type: 'private'
      })
      const { data } = apiData
      setListBatch(prev => {
            if (currentPage == 1) return data
            return {
                  ...data,
                  items: [...(prev?.items || []), ...data.items]
            }
      })
    }
    fetchBatchList()
  }, [productId, currentPage, newFilter, refreshKey])
  const handleRefreshListProductBatch= async () => {
      setCurrentPage(1)
      setRefreshKey(prevKey => prevKey + 1)
    }
  const handleNewestFilter = (value: boolean) => {
      setCurrentPage(1)
      setNewFilter(value)
  }
  return { loading, listBatch, setCurrentPage, currentPage, setNewFilter, handleRefreshListProductBatch, handleNewestFilter }
}