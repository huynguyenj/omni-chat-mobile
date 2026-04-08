import { ENV } from '@/configs/env'
import { useAuthStore } from '@/features/auth/store/auth-store'
import * as signalr from '@microsoft/signalr'

export const signalrConnection = (hubPath: string) => {
  const accessToken = useAuthStore.getState().accessToken
  console.log(ENV.apiURL);
    
  const connection = new signalr.HubConnectionBuilder()
    .withUrl(ENV.apiURL+`/${hubPath}`,
      {
        accessTokenFactory: () => accessToken as string
      })
    .withAutomaticReconnect()
    .build()
  return connection
}