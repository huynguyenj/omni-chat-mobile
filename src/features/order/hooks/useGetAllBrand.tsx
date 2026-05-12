import { useEffect, useState } from 'react'
import { type BrandType } from '../types/product-type'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'

export default function useGetAllBrand() {
  const { execute, loading } = useApiCall<BrandType[]>()
  const [listBrand, setListBrand] = useState<BrandType[]>([])
  useEffect(() => {
    const fetchBrand = async () => {
      const apiData = await execute({
        apiUrl: '/brands/get',
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
      setListBrand(data)
    }
    fetchBrand()
  }, [])
  return { loading, listBrand }
}