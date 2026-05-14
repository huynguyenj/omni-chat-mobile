import useApiCall from '@/hooks/useApiCall'
import { useEffect, useState } from 'react'
import { ProductBatchAuditDetail } from '../types/product-batch-audit-types'

type UseGetDetailAuditProps = {
      auditId: string
}

export default function useGetDetailAudit({ auditId }: UseGetDetailAuditProps) {
  const { execute, loading } = useApiCall<ProductBatchAuditDetail>()
  const [auditDetail, setAuditDetail] = useState<ProductBatchAuditDetail>()
  useEffect(() => {
      const fetchAuditDetail = async () => {
            const { data } = await execute({
                  apiUrl: `/batch-audit/get/${auditId}`,
                  method: 'get',
                  type: 'private'
            })
            setAuditDetail(data)
      }
      fetchAuditDetail()
  }, [auditId])
  
  return { loading, auditDetail }
}
