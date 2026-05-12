import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/auth-store'
import useApiCall from '@/hooks/useApiCall'
import { LoginResponseType } from '../types/login-types'
import type { ApiResponseStructure } from '@/types/api.response'
import Toast from 'react-native-toast-message'

const LoginFormSchema = z.object({
      username: z.string(),
      password: z.string().min(8, 'Mật khẩu tối thiểu 8 kí tự')
})

type LoginFormType = z.infer<typeof LoginFormSchema>

export default function useLogin() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormType>({ resolver: zodResolver(LoginFormSchema) })
  const addAuthStore = useAuthStore((s) => s.setAuthInfo)
  const { execute, loading } = useApiCall<LoginResponseType>()
  const resolveLoginPayload = (
    raw: LoginResponseType | ApiResponseStructure<LoginResponseType>
  ): LoginResponseType | null => {
    const maybeWrapper = raw as ApiResponseStructure<LoginResponseType>
    if (maybeWrapper && typeof maybeWrapper === 'object' && 'data' in maybeWrapper) {
      const wrapped = maybeWrapper.data
      if (wrapped?.accessToken && wrapped?.accountId && wrapped?.staffId && wrapped?.role) {
        return wrapped
      }
    }

    const plain = raw as LoginResponseType
    if (plain?.accessToken && plain?.accountId && plain?.staffId && plain?.role) {
      return plain
    }
    return null
  }

  const onSubmit = async (formData: LoginFormType) => {      
      const apiData = await execute({
            apiUrl: '/auth/login',
            method: 'post',
            type: 'public',
            body: formData
      })
      const { data, error } = apiData
      if (error) {
            Toast.show({
                  type: 'error',
                  text1: error
            })
            return
      }
      const payload = resolveLoginPayload(data as LoginResponseType | ApiResponseStructure<LoginResponseType>)
      if (!payload) return
      addAuthStore(
            payload.accessToken,
            payload.refreshToken,
            payload.accountId,
            payload.staffId,
            payload.role,
            payload.staffName,
            payload.avatarUrl
      )
}
  return { control, handleSubmit, onSubmit, errors, loading }
}
