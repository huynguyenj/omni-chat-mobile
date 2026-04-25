import { type SearchTaskType, type TaskListType } from '../types/task-type'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useEffect, useState } from 'react'
import { startOfDay } from '@/utils/format'
import useApiCall from '@/hooks/useApiCall'
import { PaginationStructure } from '@/types/api.response'
import { RANGE_DATE_MAP } from '../const/date-task'


export default function useGetListTasks() {
  const { execute, loading } = useApiCall<PaginationStructure<TaskListType>>()
  const staffId = useAuthStore((s) => s.staffId)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilter] = useState<SearchTaskType>({ page: currentPage, pageSize: 10 })
  const [listTasks, setListTasks] = useState<PaginationStructure<TaskListType>>()

  function getDateRange(value: string): { fromDate: Date, toDate: Date } {
    const days = RANGE_DATE_MAP[value]
    if (!days) throw new Error('Invalid range value')

    const now = new Date()

    const toDate = startOfDay(now)

    const from = new Date(toDate)
    from.setDate(from.getDate() - days)

    return {
      fromDate: from,
      toDate
    }
  }
  const handleFilterByDate = (date: string) => {
    if (date === 'All') {
      const removeDateFilter = { ...filters }
      delete removeDateFilter.fromDate
      delete removeDateFilter.toDate
      setFilter(removeDateFilter)
      return
    }
    const { fromDate, toDate } = getDateRange(date)
    setFilter((prevVal) => {
      return { ...prevVal, fromDate: fromDate, toDate: toDate }
    })
  }

  const handleFilterByType = (intentTypeId: string) => {
    if (intentTypeId == 'All') {
      const removeIntentTypeFilter = { ...filters }
      delete removeIntentTypeFilter.intentTypeId
      setFilter(removeIntentTypeFilter)
      return
    }
    setFilter((prevVal) => {
      return { ...prevVal, intentTypeId: intentTypeId }
    })
  }


  useEffect(() => {
    if (!staffId) {
      return
    }
    const fetchTasks = async () => {
      const apiData = await execute({
        apiUrl: `/staff/${staffId}/tasks`,
        method: 'post',
        type: 'private',
        body: filters
      })
      const { data, error } = apiData
      if (error) {
      //   toast.error('Lấy danh sách task thất bại!')
        return
      }
      setListTasks(prev => {
         return {
            ...data,
            items: [...(prev?.items || [] ), ...data.items]
         }
      })
    }
    fetchTasks()
  }, [filters, staffId])
  const handleRefreshTaskList = async () => {
      setCurrentPage(1)
      const resetFilter = { ...filters }
      delete resetFilter.intentTypeId
      delete resetFilter.fromDate
      delete resetFilter.toDate
      resetFilter.page = 1
      resetFilter.taskName = null
      setFilter(resetFilter)
      const apiData = await execute({
        apiUrl: `/staff/${staffId}/tasks`,
        method: 'post',
        type: 'private',
        body: filters
      })
      setListTasks(apiData.data)
  }
  return { handleFilterByDate, handleFilterByType, loading, setFilter, listTasks, handleRefreshTaskList, currentPage, setCurrentPage }
}