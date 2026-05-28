import useApiCall from '@/hooks/useApiCall'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import z from 'zod'


const chatTemplateSchema = z.object({
  code: z.string().min(1, { error: 'Code không được để trống' }),
  content: z.string().min(1, { error: 'Nội dung không được để trống' })
})

type UseUpdateChatTemplateProps = {
   onRefresh: () => void
   id: string
}


type UpdateChatTemplateType = z.infer<typeof chatTemplateSchema>

export default function useUpdateChatTemplate({ onRefresh, id }: UseUpdateChatTemplateProps) {
  const { formState: { errors }, handleSubmit, reset, control } = useForm<UpdateChatTemplateType>({ resolver: zodResolver(chatTemplateSchema) })
  const { execute, loading } = useApiCall<null>()
  const onSubmit = async (formData: UpdateChatTemplateType) => {
    const apiData = await execute({
      apiUrl: `/chat-templates/${id}`,
      method: 'put',
      type: 'private',
      body: formData
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
            text1: 'Cập nhật từ mẫu thành công'
      })
    onRefresh()
  }
  return { errors, loading, onSubmit, handleSubmit, control, reset }
}