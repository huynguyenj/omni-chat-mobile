import { PaginationStructure } from '@/types/api.response'
import { useEffect, useState } from 'react'
import { ProductDetailType } from '../types/product-type-manager'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'

export default function useGetProductListManager() {
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdate')
  const [filterPackageType, setFilterPackageType] = useState('')
  const [filterProductKind, setFilterProductKind] = useState('')
  const [filterCapacity, setFilterCapacity] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [sortType, setSortType] = useState(true)
  const [listProducts, setListProducts] = useState<PaginationStructure<ProductDetailType>>()
  const { execute, loading } = useApiCall<PaginationStructure<ProductDetailType>>()
  const [refreshKey, setRefreshKey] = useState(1)
  useEffect(() => {
    const fetchProductList = async () => {
      const params = new URLSearchParams()
      params.append('pageNumber', currentPage.toString())
      params.append('pageSize', '10')
      params.append('sortBy', sortBy.toString())
      params.append('descending', sortType.toString())
      if (searchText) params.append('search', searchText.toString())
      if (filterBrand) params.append('brandId', filterBrand)
      if (filterCapacity) params.append('volumeMl', filterCapacity)
      if (filterPackageType) params.append('packagingType', filterPackageType)
      if (filterProductKind) params.append('productKind', filterProductKind)
      const apiUrl = `/products/get?${params.toString()}`
    console.log(apiUrl);
    
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
      setListProducts(prev => {
        if (currentPage === 1) return data
        return {
            ...data,
            items: [...(prev?.items || []), ...data.items]
        }
      })
    }
    fetchProductList()
  }, [searchText, currentPage, refreshKey, sortBy, sortType, filterBrand, filterCapacity, filterPackageType, filterProductKind])

  const handleRefresh = () => {
      setCurrentPage(1)
      setRefreshKey(prevKey => prevKey + 1)
  }

  const handleFilterByBrand = (brandId: string) => {
      setCurrentPage(1)
      setFilterBrand(brandId)
  }

  const handleFilterByPackageType = (packageType: string) => {
      setCurrentPage(1)
      setFilterPackageType(packageType)
  }

  const handleFilterByProductKind = (productKind: string) => {
      setCurrentPage(1)
      setFilterProductKind(productKind)
  }

  const handleFilterByCapacity = (capacity: string) => {
      setCurrentPage(1)
      setFilterCapacity(capacity)
  }

  const handleSortBy = (sortByValue: string) => {
      setCurrentPage(1)
      setSortBy(sortByValue)
  }

  const handleSortType = (sortTypeValue: boolean) => {
      setCurrentPage(1)
      setSortType(sortTypeValue)
  }

  return { setCurrentPage, setSearchText, listProducts, loading, currentPage, handleRefresh, refreshKey, sortBy, sortType, handleFilterByBrand, handleFilterByPackageType, handleFilterByProductKind, handleFilterByCapacity, handleSortBy, handleSortType, filterBrand, filterCapacity, filterPackageType, filterProductKind }
}