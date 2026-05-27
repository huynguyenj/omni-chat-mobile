import { BatchType } from '@/features/order/types/batch-type'
import useApiCall from '@/hooks/useApiCall'
import { PaginationStructure } from '@/types/api.response'
import { useEffect, useState } from 'react'
import Toast from 'react-native-toast-message'

export default function useGetProductBatchManager({ productId }: { productId: string }) {
  const { execute, loading } = useApiCall<PaginationStructure<BatchType>>()
  const [productBatchList, setProductBatchList] = useState<PaginationStructure<BatchType>>()
  const [batchCurrentPage, setBatchCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(1)
  useEffect(() => {
    if (!productId) return
    const fetchProductBatch = async () => {
      const apiData = await execute({
        apiUrl: `/products/${productId}/batches?pageNumber=${batchCurrentPage}&pageSize=5`,
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      if (error) {
        Toast.show({
            type: 'error',
            text1: error
        })
        return
      }
      setProductBatchList(prev => {
        if (batchCurrentPage === 1) return data
        return {
            ...data,
            items: [...(prev?.items || []), ...data.items]
        }
      })
    }
    fetchProductBatch()
  }, [productId, batchCurrentPage, refreshKey])
    const handleRefresh = () => {
      setBatchCurrentPage(1)
      setRefreshKey(prevKey => prevKey + 1)
  }

  return { productBatchList, setBatchCurrentPage, loading, batchCurrentPage, handleRefresh }
}