import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'

export default function useCompleteConversation() {
  const { execute, loading } = useApiCall<null>()
  const handleCompleteConversation = async (conversationId: string) => {

    const apiData = await execute({
      apiUrl: `/support-conversation/${conversationId}/complete`,
      method: 'patch',
      type: 'private'
    })
    const { error } = apiData
    if (error) {
       Toast.show({ type: 'error', text1: error })
       return
    }
      Toast.show({ type: 'success', text1: 'Hoàn thành cuộc trò chuyện' })
  }
  return { handleCompleteConversation, loading }
}