import { useEffect, useState } from 'react'
import useApiCall from '@/hooks/useApiCall'
import { TicketType } from '../types/ticket-type'
import Toast from 'react-native-toast-message'

export default function useGetTicket({customerId}: {customerId: string}) {
  const { execute, loading } = useApiCall<TicketType[]>()
  const [listTickets, setListTickets] = useState<TicketType[]>()
  useEffect(() => {
    if (!customerId) {
      return
    }
    const fetchTicket = async () => {
      const apiData = await execute({
        apiUrl: `/support-conversations/customer/${customerId}/complete-history`,
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
      setListTickets(data)
    }
    fetchTicket()
  }, [customerId])
  return { loading, listTickets }
}