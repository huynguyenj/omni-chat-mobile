import Constants from 'expo-constants'

type EvnConfig = {
      apiURL: string
}

const getEnvConfig = (): EvnConfig => {
      const extra = Constants.expoConfig?.extra
      if (!extra?.apiURL) {
            throw new Error('Missing required env variable')
      }
      return {
            apiURL: extra.apiURL
      }
}

export const ENV = getEnvConfig()