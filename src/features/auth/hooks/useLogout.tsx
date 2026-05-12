import useApiCall from '@/hooks/useApiCall'
import { useAuthStore } from '../store/auth-store'

export default function useLogout() {
  const resetAuthStore = useAuthStore(s => s.removeAuthInfo)
  const { execute, loading } = useApiCall<null>()
  const handleLogout = async () => {
    await execute({
      apiUrl: '/auth/logout',
      method: 'post',
      type: 'private'
    })
    resetAuthStore()
  }
  return { handleLogout, loading }
}