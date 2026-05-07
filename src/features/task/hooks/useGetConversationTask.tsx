import useApiCall from '@/hooks/useApiCall'
import useContextValid from '@/hooks/useContextValid'
import { useEffect, useState } from 'react'
import { TaskType } from '../types/task-type'
import Toast from 'react-native-toast-message'

export default function useGetConversationTask({ conversationId }: { conversationId: string }) {
  const [conversationTasks, setConversationTasks] = useState<TaskType[]>()
  const { execute, loading } = useApiCall<TaskType[]>()
  const [isReFetch, setIsRefetch] = useState(false)
  useEffect(() => {
    const fetchConversationTask = async () => {
      const apiData = await execute({
        apiUrl: `/support-task/conversation/${conversationId}`,
        method: 'get',
        type: 'private'
      })
      const { data } = apiData
      setConversationTasks(data)
    }
    fetchConversationTask()
  }, [conversationId, isReFetch])

  const handleUpdateTask = async (taskId: string) => {
    const apiData = await execute({
      apiUrl: `/support-task/${taskId}/complete-task`,
      method: 'patch',
      type: 'private'
    })
    const { error, success } = apiData
    if (success) {
      Toast.show({
            type: 'success',
            text1: 'Hoàn thành nhiệm vụ'
      })
      setIsRefetch((prevState) => !prevState)
      return
    }
    if (error) {
      Toast.show({
            type: 'error',
            text1: error
      })
      return
    }
  }
  return { loading, conversationTasks, handleUpdateTask }
}