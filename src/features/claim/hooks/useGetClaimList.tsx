import { useAuthStore } from '@/features/auth/store/auth-store'
import { useEffect, useState } from 'react'
import type { ClaimType } from '../types/claim-type'
import { PaginationStructure } from '@/types/api.response'
import useApiCall from '@/hooks/useApiCall'

export default function useGetClaimList() {
  const staffId = useAuthStore((s) => s.staffId)
  const [listClaims, setListClaims] = useState<PaginationStructure<ClaimType>>()
  const { execute, loading } = useApiCall<PaginationStructure<ClaimType>>()
  const [currentPage, setCurrentPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(1)
  useEffect(() => {
    if (!staffId) {
      // toast.error('Hãy đăng nhập để lấy danh sách đơn!')
      return
    }    
    const fetchListClaims = async () => {
       if (currentPage === 1) {
        setListClaims(undefined) // clear trước data để tránh trùng data khi refresh lại trang 1
      }
      const apiData = await execute({
        apiUrl: `/claims/staff/${staffId}?pageIndex=${currentPage}&pageSize=${5}`,
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      setListClaims(prev => {
        if (currentPage === 1) return data
        return {
          ...data,
          items: [...(prev?.items || []), ...data.items]
        }
      })
      // if (error) toast.error('Xảy ra lỗi khi lấy danh sách!')
    }
    fetchListClaims()
  }, [currentPage, refreshKey])


   const handleRefreshListClaims = async () => {
      setCurrentPage(1)
      setRefreshKey(prevKey => prevKey + 1)
    }
  return { listClaims, loading, setCurrentPage, currentPage, handleRefreshListClaims }
}