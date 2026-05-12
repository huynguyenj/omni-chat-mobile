import useApiCall from '@/hooks/useApiCall'
import { zodResolver } from '@hookform/resolvers/zod'
import type React from 'react'
import { useForm } from 'react-hook-form'
import Toast from 'react-native-toast-message'
import { z } from 'zod'
const updateCustomerInfoSchema = z.object({
  customerName: z.string({ error: 'Tên khách hàng không được để trống' }),
  address: z.string({ error: 'Địa chỉ khách hàng không được để trống' }),
  email: z.string({ error: 'Email khách hàng không được để trống' }),
  phoneNumber: z.string({ error: 'Số điện thoại khách hàng không được để trống' }),
  avatarUrl: z.string().optional()
})

type CustomerUpdateForm = z.infer<typeof updateCustomerInfoSchema>

export default function useUpdateCustomerInfo({ customerId, setIsRefetch }: { customerId?: string, setIsRefetch: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { formState: { errors }, handleSubmit, reset, control } = useForm<CustomerUpdateForm>({ resolver: zodResolver(updateCustomerInfoSchema) })
  const { execute, loading } = useApiCall<null>()
  const onSubmit = async (formData: CustomerUpdateForm) => {
    if (!customerId) {
      return
    }
    const apiData = await execute({
      apiUrl: `/customer-profile/${customerId}`,
      method: 'put',
      type: 'private',
      body: formData
    })
    const { error, success } = apiData
    if (success) {
      Toast.show({
            type: 'success',
            text1: 'Cập nhật thông tin khách hàng thành công'
      })
      setIsRefetch((prev) => !prev)
      return
    }
    if (error)
      Toast.show({
            type: 'error',
            text1: error
      })
  }
  return { control, errors, loading, onSubmit, handleSubmit, reset }
}