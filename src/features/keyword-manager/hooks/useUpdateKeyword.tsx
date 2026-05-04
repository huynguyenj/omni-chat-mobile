import useApiCall from '@/hooks/useApiCall'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { KeywordDetailType } from '../types/keyword-types'

const updateKeywordInfoSchema = z.object({
  weight: z.number()
})

type UpdateKeywordFormType = z.infer<typeof updateKeywordInfoSchema>

type UseUpdateKeywordProps = {
   onRefresh: () => void
}

export default function useUpdateKeyword({ onRefresh }: UseUpdateKeywordProps) {
  const { execute, loading } = useApiCall<null>()
  const { handleSubmit, reset, control } = useForm<UpdateKeywordFormType>({ resolver: zodResolver(updateKeywordInfoSchema) })
  const [keywordSelected, setKeywordSelected] = useState<KeywordDetailType>()

  const onSubmit = async (formData: UpdateKeywordFormType) => {
    const apiData = await execute({
      apiUrl: `/keywords/update/${keywordSelected?.id}`,
      method: 'put',
      type: 'private',
      body: formData
    })
    const { error } = apiData
    if (error) {
      // toast.error('Cập nhật keyword thất bại!')
      return
    }
//     toast.success('Cập nhật keyword thành công')
    onRefresh()
  }
  return { handleSubmit, control, onSubmit, setKeywordSelected, reset, loading }
}