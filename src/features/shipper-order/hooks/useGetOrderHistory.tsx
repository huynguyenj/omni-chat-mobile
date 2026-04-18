import { useEffect, useState } from 'react'
import useApiCall from '@/hooks/useApiCall'
import { OrderHistoryType } from '../types/order-history'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { normalizeDate } from '@/utils/format'

export default function useGetOrderHistory() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const { execute, loading } = useApiCall<OrderHistoryType>()
  const [orderHistory, setOrderHistory] = useState<OrderHistoryType>()
  const [currentPage, setCurrentPage] = useState(1)
  const { staffId } = useAuthStore()
  useEffect(() => {
    const fetchOrderHistory = async () => {      
    if (!staffId) return
    const params = new URLSearchParams()
    params.append('shipperId', staffId)

    if (startDate) {
      params.append('fromDate', normalizeDate(startDate))
    }

    if (toDate) {
      params.append('toDate', normalizeDate(toDate))
    }

    params.append('pageNumber', currentPage.toString())
    params.append('pageSize', '5')

    const apiUrl = `/orders/delivered/count?${params.toString()}`

    console.log(apiUrl)

            
      const apiData = await execute({
            apiUrl: apiUrl,
            method: 'get',
            type: 'private'
      })
       const { data, error } = apiData
       if (error) return
       setOrderHistory(prev => {
            if (currentPage === 1) return data
            return {
                  ...data,
                  orders: { 
                        ...data.orders,
                        items: [...(prev?.orders.items || []), ...data.orders.items]
                   }
            }
       })
    }
    fetchOrderHistory()
  }, [startDate, toDate, currentPage])
  return { setStartDate, setToDate, startDate, toDate, orderHistory, setCurrentPage, currentPage, loading }
}