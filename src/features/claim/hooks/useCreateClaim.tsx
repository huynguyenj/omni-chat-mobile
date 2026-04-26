import { useAuthStore } from '@/features/auth/store/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'
import type { ClaimCreation } from '../types/claim-type'
import { Dispatch, SetStateAction, useState } from 'react'
import useApiCall from '@/hooks/useApiCall'

const ClaimFormSchema = z.object({
  claimTypeId: z.string({ error: 'Hãy chọn loại đơn bạn muốn tạo' }),
  reason: z.string({ error: 'Xin hãy viết lí do mà bạn viết đơn' }),
  description: z.string()
})

type ClaimFormType = z.infer<typeof ClaimFormSchema>
type UseClaimCreateProps = {
   onRefresh: () => void
}
export default function useCreateClaim({ onRefresh }: UseClaimCreateProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<ClaimFormType>({ resolver: zodResolver(ClaimFormSchema) })
  const staffId = useAuthStore((s) => s.staffId)
  const { execute, loading } = useApiCall<null>()
  const [conversationId, setConversationId] = useState<string | null>(null)
  const onSubmit = async (formData: ClaimFormType) => {    
    if (!staffId) {
      // toast.error('Hãy đăng nhập trước khi tạo đơn!')
      return
    }
    const finalForm: ClaimCreation = {
      staffId: staffId,
      claimTypeId: formData.claimTypeId,
      description: formData.description,
      reason: formData.reason,
      supportConversationId: conversationId
    }
    console.log(finalForm);
    
    const apiData = await execute({
      apiUrl: '/claims',
      method: 'post',
      type: 'private',
      body: finalForm
    })

    const { error } = apiData
    console.log(error);
    if (error) return
    onRefresh()
    
//     if (error) toast.error('Tạo đơn thất bại! Xin hãy thử lại')
//     else toast.success('Tạo đơn thành công')
  }
  return { onSubmit, loading, handleSubmit, errors, control, setConversationId, conversationId }
}