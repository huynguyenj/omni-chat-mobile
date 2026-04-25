import { Dispatch, SetStateAction, useEffect, useState } from 'react'

type UsePaginationProps = {
      currentPage: number
      setPage: Dispatch<SetStateAction<number>>
      totalPage: number
      loading: boolean
}

export default function usePagination({ currentPage, loading, setPage, totalPage }: UsePaginationProps) {
  const [hasMore, setHasMore] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const loadMore = () => {
      if (loading || !hasMore) return
      if (currentPage === totalPage) {            
            setHasMore(false)
            return
      }
      setPage(prev => prev + 1)
  }

  const refresh = () => {
      if (loading) return
      
      setRefreshing(true)
      setPage(1)
      if (currentPage < totalPage) {
          setHasMore(true)
      }

      setPage(1)

  }

  useEffect(() => {
      if (!loading) setRefreshing(false)
  }, [loading])
  return { loadMore, refresh, refreshing }
}