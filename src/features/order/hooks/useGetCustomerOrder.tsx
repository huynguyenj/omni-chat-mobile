import { useEffect, useState } from 'react'
import type { OrderType } from '../types/order-type'
import useApiCall from '@/hooks/useApiCall'
import { PaginationStructure } from '@/types/api.response'
import Toast from 'react-native-toast-message'

type UseGetListOrderCustomerProps = {
   customerId?: string
}

export default function useGetOrderCustomer({ customerId }: UseGetListOrderCustomerProps) {
  const { execute, loading } = useApiCall<PaginationStructure<OrderType>>()
  const [listOrders, setListOrders] = useState<PaginationStructure<OrderType>>()
  const [currentPage, setCurrentPage] = useState(1)
  const [status, setStatus] = useState('')
  const [newest, setNewest] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  useEffect(() => {
    if (!customerId) {
      return
    }
    const fetchCustomerOrder = async () => {
      const params = new URLSearchParams()
      params.append('pageNumber', String(currentPage))
      params.append('pageSize', '10')
      params.append('sortBy', 'orderDate')
      params.append('descending', String(newest))
      if (status) params.append('orderStatuses', status)
      const apiUrl = `/orders/customer/${customerId}/get?${params}`

      const apiData = await execute({
        apiUrl: apiUrl,
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
      setListOrders(prev => {
         if (currentPage === 1) return data
         return {
            ...data,
            items: [...(prev?.items || [] ), ...data.items]
         }
      })
    }
    fetchCustomerOrder()
  }, [customerId, currentPage, refreshKey, status, newest])
  const handleFilterByStatus = (status: string) => {
      setCurrentPage(1)
      setStatus(status === 'All' ? '' : status)
  }
  const handleSort = () => {
      setCurrentPage(1)
      setNewest(prevState => !prevState)
  }

  const handleRefresh = () => {
      setCurrentPage(1)
      setRefreshKey(prevKey => prevKey + 1)
  }

  return { listOrders, loading, currentPage, setCurrentPage, handleFilterByStatus, status, newest, handleSort, handleRefresh }
}