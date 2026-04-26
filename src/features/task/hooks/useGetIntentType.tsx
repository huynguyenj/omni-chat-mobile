import { useEffect, useState } from 'react'
import type { IntentType } from '../types/task-type'
import useApiCall from '@/hooks/useApiCall'

export default function useGetIntentType() {
  const [intentType, setIntentType] = useState<IntentType[]>()
  const { execute } = useApiCall<IntentType[]>()
  useEffect(() => {
    const fetchIntentType = async () => {
      const apiData = await execute({
        apiUrl: 'intent-type/gets',
        method: 'get',
        type: 'private'
      })
      setIntentType(apiData.data)
    }
    fetchIntentType()
  }, [])
  return { intentType }
}