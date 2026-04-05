import { ENV } from './env'
export const BASE_URL = ENV.apiURL
import axios, { AxiosError, type AxiosInstance } from 'axios'
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
}, (error: AxiosError) => {
  // const message = error.response?.data
  return Promise.reject()
})
