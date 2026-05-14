import { Dispatch, SetStateAction } from 'react'
import useApiCall from '@/hooks/useApiCall'

type UseUpdateCompleteOrder = {
      onRefresh: () => void
}

export default function useUpdateCompleteOrder({ onRefresh }: UseUpdateCompleteOrder) {
  const { execute, loading } = useApiCall<null>()
  const handleCompleteOrder = async (orderId: string) => {
      const apiData = await execute({
            apiUrl: `/orders/${orderId}/complete-delivery`,
            method: 'patch',
            type: 'private'
      })
      const { error } = apiData
      if (error) return
      onRefresh()

  }
  return { loading, handleCompleteOrder }
}