import useApiCall from '@/hooks/useApiCall'
import { useState, type Dispatch, type SetStateAction } from 'react'

type UseDeleteKeywordProps = {
  onRefresh: () => void
  onCloseModalDelete: Dispatch<SetStateAction<boolean>>
}

export default function useDeleteKeyword({ onRefresh, onCloseModalDelete }: UseDeleteKeywordProps) {
  const { execute, loading } = useApiCall<null>()
  const [keywordId, setKeywordId] = useState('')
  const handleDelete = async () => {
    const apiData = await execute({
      apiUrl:  `/keywords/delete/${keywordId}`,
      method: 'del',
      type: 'private'
    })
    const { error } = apiData
    if (error) {
      // toast.error('Xóa keyword thất bại')
      return
    }
//     toast.success('Xóa keyword thành công')
    onRefresh()
    onCloseModalDelete(false)
  }
  return { loading, handleDelete, setKeywordId }
}