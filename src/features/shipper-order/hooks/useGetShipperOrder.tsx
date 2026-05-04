import { useAuthStore } from '@/features/auth/store/auth-store'
import useApiCall from '@/hooks/useApiCall'
import { PaginationStructure } from '@/types/api.response'
import { useEffect, useState } from 'react'
import { OrderShipperType } from '../types/order-shipper'

export default function useGetShipperOrder() {
  const { staffId } = useAuthStore()
  const { execute, loading } = useApiCall<PaginationStructure<OrderShipperType>>()
  const [orderShipperList, setOrderShipperList] = useState<PaginationStructure<OrderShipperType>>()
  const [currentPage, setCurrentPage] = useState(1)
  const [onRefresh, setOnRefresh] = useState(false)
  useEffect(() => {
      const fetchOrderShipper = async () => {
       
            const apiData = await execute({
                  apiUrl: `/orders/shipper/${staffId}/pending?pageNumber=${currentPage}&pageSize=4`,
                  method: 'get',
                  type: 'private'
            })
            const { data, error } = apiData
            if (error) return
            setOrderShipperList(prev => {
                  if (currentPage === 1) {
                  // refresh → replace
                  return data
            }

                  // load more → append
            return {
            ...data,
            items: [...(prev?.items || []), ...data.items]
            }
    })
      }
      fetchOrderShipper()
  }, [currentPage, onRefresh])

  return { loading, orderShipperList, setCurrentPage, currentPage, setOnRefresh }
}
