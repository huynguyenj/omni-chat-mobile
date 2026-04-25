import { useAuthStore } from '@/features/auth/store/auth-store'
import { useEffect, useState } from 'react'
import { type ConversationClaimType } from '../types/claim-type'
import { PaginationStructure } from '@/types/api.response'
import useApiCall from '@/hooks/useApiCall'

export default function useGetListConversationByStaffId({ isChangeTaskTypeSelected }: { isChangeTaskTypeSelected: boolean }) {
  const staffId = useAuthStore(s => s.staffId)
  const [currentPage, setCurrentPage] = useState(1)
  const { execute, loading } = useApiCall<PaginationStructure<ConversationClaimType>>()
  const [listConversation, setListConversation] = useState<PaginationStructure<ConversationClaimType>>()

  useEffect(() => {
    if (!staffId) return
    if (!isChangeTaskTypeSelected) return
    const fetchListConversation = async () => {
      const apiData = await execute({
        apiUrl: `/support-conversations/staff/${staffId}/options?pageNumber${currentPage}&pageSize=5`,
        method:'get',
        type: 'private'
      })
      const { data, error } = apiData
      if (error) {
      //   toast.error('Lấy danh sách cuộc trò chuyện thất bại!')
        return
      }
      setListConversation(data)
    }
    fetchListConversation()
  }, [isChangeTaskTypeSelected, currentPage, staffId])
  return { loading, setCurrentPage, setListConversation, listConversation, currentPage }
}