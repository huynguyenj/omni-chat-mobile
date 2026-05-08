import { useAuthStore } from '@/features/auth/store/auth-store'
import type { RefundOrderRequest } from '../types/order-type'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type UseRefundRequestProps = {
   orderId: string,
   customerId: string
}

const postRequestSchema = z.object({
  reason: z.string().min(1, 'Lí do không được để trống'),
  type: z.string().min(1, 'Hãy lựa kiểu hoàn trả'),
})

type PostRequestFormType = z.infer<typeof postRequestSchema>

export default function usePostRequestSale({ orderId, customerId }: UseRefundRequestProps) {
  const { execute, loading } = useApiCall<null>()
  const { control, reset, formState: { errors }, handleSubmit } = useForm<PostRequestFormType>({ resolver: zodResolver(postRequestSchema) })
  const staffId = useAuthStore((s) => s.staffId)
  const handleRefundOrder = async (listItems: Map<string, { number: number, price: number, name: string }>, postForm: PostRequestFormType) => {
    if (!staffId) {
      return
    }
    const refundData: RefundOrderRequest = {
      customerId: customerId,
      orderId: orderId,
      reason: postForm.reason,
      type: postForm.type,
      presentByStaffId: staffId,
      postSaleItems: Array.from(listItems).map(([orderItemId, value]) => ({
        orderItemId: orderItemId,
        quantity: value.number
      }))
    }
    
    const apiData = await execute({
      apiUrl: '/post-sale-requests/create',
      method: 'post',
      type: 'private',
      body: refundData
    })
    if (apiData.error) Toast.show({ type: 'error', text1: apiData.error })
    else Toast.show({ type: 'success', text1: 'Hoàn trả thành công! Chờ quản lí xét duyệt'})
  }

  return { handleRefundOrder, loading, handleSubmit, control, reset, errors }
}