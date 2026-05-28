import { useAuthStore } from '@/features/auth/store/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'
import type { ClaimCreation } from '../types/claim-type'
import { Dispatch, SetStateAction, useState } from 'react'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'

const ClaimFormSchema = z.object({
  claimTypeId: z.string({ error: 'Hãy chọn loại đơn bạn muốn tạo' }),
  reason: z.string({ error: 'Xin hãy viết lí do mà bạn viết đơn' }),
  description: z.string().optional()
})

type ClaimFormType = z.infer<typeof ClaimFormSchema>
type UseClaimCreateProps = {
   onRefresh: () => void
}
export default function useCreateClaim({ onRefresh }: UseClaimCreateProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<ClaimFormType>({ resolver: zodResolver(ClaimFormSchema) })
  const staffId = useAuthStore((s) => s.staffId)
  const { execute, loading } = useApiCall<null>()
  const [conversationId, setConversationId] = useState('')
  const [isChangeTaskSelected, setIsChangeTaskSelected] = useState(false)
  const [messageError, setMessageError] = useState('')
  const onSubmit = async (formData: ClaimFormType) => {    
    if (!staffId) {
      // toast.error('Hãy đăng nhập trước khi tạo đơn!')
      return
    }
    if (isChangeTaskSelected && !conversationId) {
      console.log('erre');
      setMessageError('Hãy chọn cuộc trò chuyện')
      return
    }
    const finalForm: ClaimCreation = {
      staffId: staffId,
      claimTypeId: formData.claimTypeId,
      description: formData.description ?? '',
      reason: formData.reason,
      supportConversationId: conversationId
    }
    
    const apiData = await execute({
      apiUrl: '/claims',
      method: 'post',
      type: 'private',
      body: finalForm
    })

    const { error } = apiData
    if (error) {
      Toast.show({
        type: 'error',
        text1: error
      })      
    }
    Toast.show({
      type: 'success',
      text1: 'Tạo đơn thành công'
    })
    onRefresh()
    
//     if (error) toast.error('Tạo đơn thất bại! Xin hãy thử lại')
//     else toast.success('Tạo đơn thành công')
  }
  return { onSubmit, loading, handleSubmit, errors, control, setConversationId, conversationId, messageError, isChangeTaskSelected, setIsChangeTaskSelected }
}