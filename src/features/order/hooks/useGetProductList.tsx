import { useEffect, useState } from 'react'
import { type ProductDetailType } from '../types/product-type'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'

export default function useGetProductForOrderProcess() {
  const [productKind, setProductKind] = useState('')
  const [productPackagingType, setProductPackageType] = useState('')
  const [productVolume, setProductVolume] = useState('')
  const [productBrand, setProductBrand] = useState('')
  const { execute, loading } = useApiCall<ProductDetailType[]>()
  const [productList, setProductList] = useState<ProductDetailType[]>()

  useEffect(() => {
    const fetchListProduct = async () => {
      const params = new URLSearchParams()

      if (productKind) params.append('ProductKind', productKind)
      if (productVolume) params.append('VolumeMl', productVolume)
      if (productPackagingType) params.append('PackagingType', productPackagingType)
      if (productBrand) params.append('BrandId', productBrand)
      const apiUrl = `/products/get/create-order?${params}`

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
      setProductList(data)
    }
    fetchListProduct()
  }, [productBrand, productKind, productVolume, productPackagingType])
  return { setProductBrand, setProductKind, setProductVolume, setProductPackageType, loading, productList, productKind, productVolume, productBrand, productPackagingType}
}