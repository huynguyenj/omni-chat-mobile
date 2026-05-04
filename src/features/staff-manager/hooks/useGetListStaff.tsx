import { useEffect, useState } from 'react'
import { type StaffDetailType } from '../types/staff-type'
import useApiCall from '@/hooks/useApiCall'
import { PaginationStructure } from '@/types/api.response'

export default function useGetListStaff() {
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [listStaffs, setListStaffs] = useState<PaginationStructure<StaffDetailType>>()
  const [sortBy, setSortBy] = useState('createdate')
  const [sortType, setSortType] = useState('true')
  const [refreshKey, setRefreshKey] = useState(1)
  const { execute, loading } = useApiCall<PaginationStructure<StaffDetailType>>()
  useEffect(() => {
    const fetchStaffList = async () => {
      if (currentPage === 1) {
        setListStaffs(undefined) // clear trước data để tránh trùng data khi refresh lại trang 1
      }
      const params = new URLSearchParams()
      params.append('pageNumber', currentPage.toString())
      params.append('pageSize', '6')
      params.append('sortBy', sortBy.toString())
      params.append('descending', sortType.toString())
      if (searchText) params.append('search', searchText.toString())
      const apiUrl = `/staff/get?${params.toString()}`
      const apiData = await execute({
        apiUrl: apiUrl,
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      if (error) {
      //   toast.error('Lấy danh sách nhân viên thất bại')
        return
      }
      setListStaffs(prev => {
            if (currentPage === 1) return data
            return {
                  ...data,
                  items: [...(prev?.items || []), ...data.items]
            }
      })
    }
    fetchStaffList()
  }, [searchText, currentPage, sortBy, sortType, refreshKey])

  
  const handleRefreshStaffList = async () => {
      setListStaffs(undefined)
      setSortBy('createdate')
      setSortType('false')
      setSearchText('')
      setCurrentPage(1)
      setRefreshKey(prevKey => prevKey + 1)
  }
  return { setCurrentPage, setSearchText, listStaffs, loading, currentPage, handleRefreshStaffList, setSortBy, setSortType, sortBy, sortType }
}
