const BASE_URL = ''
import axios, { type AxiosInstance } from 'axios'
export const apiPrivate: AxiosInstance = axios.create({
  baseURL: BASE_URL
})
export const apiPublic: AxiosInstance = axios.create({
  baseURL: BASE_URL
})

apiPublic.interceptors.response.use((response) => {
  return response
})


apiPrivate.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer'
  return config
}, error => Promise.reject(error))

apiPrivate.interceptors.response.use((response) => {
  return response.data
})
