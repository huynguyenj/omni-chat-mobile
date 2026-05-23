import useApiCall from '@/hooks/useApiCall'
import { useState, type Dispatch, type SetStateAction } from 'react'
import Toast from 'react-native-toast-message'

type UseDeleteProductProps = {
  onRefresh: Dispatch<SetStateAction<boolean>>
  onCloseModalDelete: Dispatch<SetStateAction<boolean>>
}

export default function useDeleteProduct({ onRefresh, onCloseModalDelete }: UseDeleteProductProps) {
  const { execute, loading } = useApiCall<null>()
  const handleDelete = async (productId: string) => {
    const apiData = await execute({
      apiUrl:  `/products/delete/${productId}`,
      method: 'del',
      type: 'private'
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
         type: 'error',
         text1: 'Xóa sản phẩm thành công'
      })
    onRefresh(prev => !prev)
    onCloseModalDelete(false)
  }
  return { loading, handleDelete }
}