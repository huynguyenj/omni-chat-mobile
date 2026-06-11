import useApiCall from '@/hooks/useApiCall'
import { useState } from 'react'
import Toast from 'react-native-toast-message'

type UseDeleteTaskProps = {
  onRefresh: () => void
}

export default function useDeleteTask({ onRefresh }: UseDeleteTaskProps) {
  const { execute, loading } = useApiCall<null>()
  const [taskId, setTaskId] = useState('')
  const handleDelete = async () => {
      const apiData = await execute({
            apiUrl: `/support-task/${taskId}/delete`,
            method: 'del',
            type: 'private'
      })
      if (apiData.error) {
            Toast.show({
                  type: 'error',
                  text1: apiData.error
            })
            return
      }
      Toast.show({
            type: 'success',
            text1: 'Xóa nhiệm vụ thành công'
      })
      onRefresh()
  }
  return { loading, handleDelete, setTaskId }
}
