import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import type { ClaimCategory } from '../types/claim-type'
import useApiCall from '@/hooks/useApiCall'


export default function useGetAllClaimType() {
  const [claimCategories, setClaimCategories] = useState<ClaimCategory[]>()
  const { execute, loading } = useApiCall<ClaimCategory[]>()


  useEffect(() => {
    const getClaimCategories = async () => {
      const apiData = await execute({
        apiUrl: '/claim-type/get-all',
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      setClaimCategories(data)

      // if (error) toast.error('Lấy loại đơn bị lỗi! Hãy thử lại.')
    }
    getClaimCategories()
  }, [])
  return { loading, claimCategories }
}