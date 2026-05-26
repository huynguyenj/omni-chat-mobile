import { useState } from 'react'
import useApiCall from '@/hooks/useApiCall'
import { BatchCreateType, BatchItemType } from '../types/product-type-manager'
import Toast from 'react-native-toast-message'



export default function useCreateBatchProduct({ onRefresh }: { onRefresh: () => void }) {
  const [listBatchItems, setListBatchItems] = useState<BatchItemType[]>([])
  const [productId, setProductChoseForBatch] = useState('')
  const { execute, loading } = useApiCall<null>()
  const [manuFactureDate, setManuFactureDate] = useState<Date | null>(null) 
  const [quantity, setQuantity] = useState(1)
  const handleCreateBatch = async () => {
    if (!productId) return
    const productBatchData: BatchCreateType = {
      productId: productId,
      productBatch: [...listBatchItems]
    }
    
    const apiData = await execute({
      apiUrl: '/products/add-stock',
      method: 'post',
      type: 'private',
      body: [productBatchData]
    })
    const { error } = apiData
    if (error) {
      Toast.show({
            type: 'error',
            text1: error
      })
      return
    }
    Toast.show({
      type: 'success',
      text1: 'Thêm lô sản phẩm thành công'
    })
    onRefresh()
  }
  const handleAddBatch = () => {
    if (manuFactureDate) {
      setListBatchItems(prev => [...prev, { manuFactureDate: manuFactureDate, quantity: quantity }])
    }
    setManuFactureDate(null)
    setQuantity(1)
  }
  const handleDeleteBatch = (batchItem: BatchItemType) => {
    const updateListBatch = listBatchItems.filter((batch) => batch !== batchItem)
    setListBatchItems(updateListBatch)
    setManuFactureDate(null)
    setQuantity(1)
  }
  return { handleCreateBatch, setListBatchItems, listBatchItems, setProductChoseForBatch, loading, handleAddBatch, handleDeleteBatch, setManuFactureDate, setQuantity, quantity, manuFactureDate }
}