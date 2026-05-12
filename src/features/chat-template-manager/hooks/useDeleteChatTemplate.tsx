import useApiCall from "@/hooks/useApiCall"
import { Dispatch, SetStateAction } from "react"
import Toast from "react-native-toast-message"

type UseDeleteChatTemplateProps = {
   onRefresh: () => void
   onCloseModalDelete: Dispatch<SetStateAction<boolean>>
}

export default function useDeleteChatTemplate({ onRefresh, onCloseModalDelete }: UseDeleteChatTemplateProps) {
  const { execute, loading } = useApiCall<null>()
  const handleDelete = async (id: string) => {
    const apiData = await execute({
      apiUrl: `/chat-templates/${id}`,
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
            text1: 'Xóa từ khóa mẫu thành công'
      })
    onCloseModalDelete(false)
    onRefresh()
  }
  return { handleDelete, loading }
}