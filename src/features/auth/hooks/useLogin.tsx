import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../store/auth-store'
import useApiCall from '@/hooks/useApiCall'
import { LoginResponseType } from '../types/login-types'

const LoginFormSchema = z.object({
      username: z.string(),
      password: z.string().min(8, 'Mật khẩu tối thiểu 8 kí tự')
})

type LoginFormType = z.infer<typeof LoginFormSchema>

export default function useLogin() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormType>({ resolver: zodResolver(LoginFormSchema) })
  const addAuthStore = useAuthStore((s) => s.setAccessToken)
  const { execute, loading } = useApiCall<LoginResponseType>()
  const onSubmit = async (formData: LoginFormType) => {      
      const apiData = await execute({
            apiUrl: '/auth/login',
            method: 'post',
            type: 'public',
            body: formData
      })
      const { data, error } = apiData
      if (error) return
      console.log(data);
      
      addAuthStore(data.accessToken, data.accountId, data.staffId, data.role)
}
  return { control, handleSubmit, onSubmit, errors, loading }
}