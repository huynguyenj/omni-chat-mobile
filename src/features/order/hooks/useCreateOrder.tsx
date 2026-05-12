import useApiCall from '@/hooks/useApiCall'
import type { OrderRequestType } from '../types/order-type'
import Toast from 'react-native-toast-message'

export default function useCreateOrder() {
  const { execute, loading } = useApiCall<null>()
  const handleOrder = async (orderData: OrderRequestType) => {
    const apiData = await execute({
      apiUrl: '/orders/create',
      method: 'post',
      type: 'private',
      body: orderData
    })
    const { error, success } = apiData
    if (success) {
      Toast.show({
            type: 'success',
            text1: 'Đặt hàng thành công!'
      })
      return
    }
    if (error) Toast.show({
      type: 'error',
      text1: error as string
    })
  }
  return { loading, handleOrder }
}