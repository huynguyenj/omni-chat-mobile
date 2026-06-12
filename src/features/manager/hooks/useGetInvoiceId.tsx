import { useState } from 'react'
import useApiCall from '@/hooks/useApiCall'
import Toast from 'react-native-toast-message'

export type PaycheckInvoiceStatus = 'Completed' | 'Pending' | 'Cancelled' | 'Refunded' | 'PendingRefund';
export type PaycheckInvoiceMethod = 'BankTransfer'| 'Cash';


export interface InvoiceType {
  id: string;
  customerId: string;
  startedDate: string;
  endedDate: string;
  total: number;
  invoiceStatus: PaycheckInvoiceStatus;
  invoiceMethod: PaycheckInvoiceMethod;
  completedDate: string;
  createAt: string;
  isDeleted: boolean;
  paidAmount: number;
  deductedAmount: number;
  invoiceCode: number;

   customerEmail: string
   customerName: string
   customerPhoneNumber: string
   customerAddress: string
}


export default function useGetInvoiceById() {
  const { execute, loading } = useApiCall<InvoiceType>()
  const [invoice, setInvoice] = useState<InvoiceType>()
  const handleGetPayInvoiceId = async (invoiceId: string) => {
      
    const apiData = await execute({
      apiUrl: `/invoices/get/${invoiceId}`,
      method: 'get',
      type: 'private'
    })
    console.log(apiData);
    
    if (apiData.error) {
      Toast.show({
            type: 'error',
            text1: apiData.error
      })
      return
    }
    setInvoice(apiData.data)
  }
  return { handleGetPayInvoiceId, loading, invoice }
}