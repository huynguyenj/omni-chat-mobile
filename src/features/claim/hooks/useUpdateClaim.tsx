import { useAuthStore } from '@/features/auth/store/auth-store'
import useApiCall from '@/hooks/useApiCall'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import z from 'zod'

const UpdateFormSchema = z.object({
  reason: z.string().min(1, { error: 'Xin hãy viết lí do mà bạn viết đơn' }),
  description: z.string().optional()
})

type ClaimFormType = z.infer<typeof UpdateFormSchema>

type UseUpdateClaimProps = {
   onRefresh: () => void
}

export default function useUpdateClaim({ onRefresh }: UseUpdateClaimProps) {
  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<ClaimFormType>({ resolver: zodResolver(UpdateFormSchema) })
  const staffId = useAuthStore((s) => s.staffId)
  const [chosenClaimId, setChosenClaimId] = useState('')
  const { execute, loading } = useApiCall<null>()
  const onSubmit = async (formData: ClaimFormType) => {
    if (!staffId) {
      Toast.show({
            type: 'error',
            text1: 'Hãy đăng nhập trước khi tạo đơn!'
      })
      return
    }
    if (!chosenClaimId) {
      Toast.show({
            type: 'error',
            text1: 'Hãy loại đơn mà bạn muốn cập nhật'
      })
      return
    }
    const finalForm: ClaimFormType = {
      description: formData.description ?? '',
      reason: formData.reason
    }


    const apiData = await execute({
      apiUrl: `/claims/${chosenClaimId}`,
      method: 'put',
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
    else {
            Toast.show({
            type: 'success',
            text1:'Cập nhật đơn thành công'
      })
      onRefresh()
    }
  }
  return { onSubmit, loading, register, handleSubmit, errors, control, setChosenClaimId, reset }
}