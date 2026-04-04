import { useState } from 'react'
import { ApiResponseStructure } from '../types/api.response'
import { apiPrivate, apiPublic } from '../configs/axios.config'

type UseApiCallType = {
  apiUrl: string
  type: 'public' | 'private'
  method: 'post' | 'get' | 'put' | 'del' | 'patch'
  body?: object
}

// type UseApiCallReturnType<T> = {
//   data: T
//   loading: boolean
//   error?: string | unknown
// }

export default function useApiCall<T>() {
  const [loading, setLoading] = useState(false)
  const apiMethodSelect = ({ apiUrl, method, type='public', body }: UseApiCallType): Promise<ApiResponseStructure<T>> => {
    switch (method) {
    case 'post':
      if (type === 'private') return apiPrivate.post(apiUrl, body)
      else return apiPublic.post(apiUrl, body)
    case 'get':
      if (type === 'private') return apiPrivate.get(apiUrl)
      else return apiPublic.get(apiUrl)
    case 'put':
      if (type === 'private') return apiPrivate.put(apiUrl, body)
      else return apiPublic.put(apiUrl, body)
    case 'patch':
      if (type === 'private') return apiPrivate.patch(apiUrl, body)
      else return apiPublic.patch(apiUrl, body)
    case 'del':
      if (type === 'private') return apiPrivate.delete(apiUrl)
      else return apiPublic.delete(apiUrl)
    }
  }

  const execute = async ({ apiUrl, type, method, body }: UseApiCallType) => {
    let data
    let errorResponse
    try {
      setLoading(true)
      const response = await apiMethodSelect({ apiUrl, type, method, body })
      data = response.data as T
      errorResponse = null
    } catch (error) {
      console.log(error)
      data = null as unknown as T
      errorResponse = 'error'
    } finally {
      setLoading(false)
    }
    return { data, error: errorResponse }
  }
  return { execute, loading }
}
