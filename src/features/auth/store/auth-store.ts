import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type AuthType = {
  accessToken: string | null
  refreshToken: string | null
  role: string | null
  accountId: string | null
  staffId: string | null
  staffName: string | null
  avatarUrl: string | null
  setAccessToken: (accessToken: string) => void,
  setAuthInfo: (accessToken: string, refreshToken: string, accountId: string, staffId: string, role: string, staffName: string, avatarUrl: string | null) => void
  removeAuthInfo: () => void
}

export const useAuthStore = create<AuthType>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      accountId: null,
      role: null,
      staffId: null,
      avatarUrl: null,
      staffName: null,
      setAccessToken: (accessToken: string) => set({ accessToken: accessToken }),
      setAuthInfo: (accessToken: string, refreshToken: string, accountId: string, staffId: string, role: string, staffName: string, avatarUrl: string | null) => set({ accessToken: accessToken, refreshToken: refreshToken, accountId: accountId, staffId: staffId, role: role, avatarUrl: avatarUrl, staffName: staffName }),
      removeAuthInfo: () => set((state) => ({ ...state, accessToken: null, accountId: null, role: null, staffId: null }))
    }),
    { name: 'omni-chat-auth-info' , storage: createJSONStorage(() => AsyncStorage),}
  )
)