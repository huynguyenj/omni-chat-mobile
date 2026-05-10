import useApiCall from '@/hooks/useApiCall'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import z from 'zod'

const chatTemplateSchema = z.object({
  code: z.string({ error: 'Code không được để trống' }),
  content: z.string({ error: 'Nội dung không được để trống' })
})

type CreateChatTemplateType = z.infer<typeof chatTemplateSchema>

type UseCreateChatTemplateProps = {
   onRefresh: () => void
}

export default function useCreateChatTemplate({ onRefresh }: UseCreateChatTemplateProps) {
  const { formState: { errors }, handleSubmit, register, control, reset } = useForm<CreateChatTemplateType>({ resolver: zodResolver(chatTemplateSchema) })
  const { execute, loading } = useApiCall<null>()
  const onSubmit = async (formData: CreateChatTemplateType) => {
    const apiData = await execute({
      apiUrl: '/chat-templates',
      method: 'post',
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
            text1: 'Tạo từ khóa mẫu thành công'
      })
    onRefresh()
  }
  return { errors, loading, onSubmit, handleSubmit, register, control, reset }
}