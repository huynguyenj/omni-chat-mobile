import useApiCall from '@/hooks/useApiCall'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'

const keywordSchema = z.object({
  intentTypeId: z.string({ error: 'Hãy chọn chức năng' }),
  weight: z.number({ error: 'Hãy điền mức độ ưu tiên' }),
  keywordText: z.string({ error: 'Hãy điền từ keyword' })
})

type KeywordFormType = z.infer<typeof keywordSchema>

type UseCreateKeywordProps = {
   onRefresh: () => void
}

export default function useCreateKeyword({ onRefresh }: UseCreateKeywordProps) {
  const { control, formState: { errors }, register, handleSubmit, reset } = useForm<KeywordFormType>({ resolver: zodResolver(keywordSchema) })
  const { execute, loading } = useApiCall<null>()
  const onSubmit = async (formData: KeywordFormType) => {
    const apiData = await execute({
      apiUrl: '/keywords/create',
      method: 'post',
      type: 'private',
      body: formData
    })
    const { error } = apiData
    if (error) {
      // toast.error('Tạo keyword thất bại')
      return
    }
//     toast.success('Tạo keyword thành công')
    onRefresh()
  }
  return { loading, control, errors, register, handleSubmit, onSubmit, reset }
}