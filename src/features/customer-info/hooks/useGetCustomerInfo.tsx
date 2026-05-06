import { useEffect, useState } from 'react'
import { CustomerInfoDetailType } from '../types/customer-info-types'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'

type UseCustomerInfoProps = {
   conversationId: string
}

export default function useGetCustomerInfo({ conversationId }: UseCustomerInfoProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfoDetailType>()
  const { execute, loading } = useApiCall<CustomerInfoDetailType>()
  const [isRefetch, setIsRefetch] = useState(false)
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      const apiData = await execute({
        apiUrl: `/customer-profile/${conversationId}`,
        method: 'get',
        type: 'private'
      })
      const { data, error } = apiData
      if (error) {
        Toast.show({
            type: 'error',
            text1: error
        })
        return
      }
      setCustomerInfo(data)
    }
    fetchCustomerInfo()
  }, [conversationId, isRefetch])
  return { customerInfo, loading, setIsRefetch }
}