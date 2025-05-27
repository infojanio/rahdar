import axios, { AxiosError } from 'axios'
import { AppError } from '../utils/AppError'
import {
  storageAuthTokenGet,
  storageAuthTokenSave,
  storageAuthTokenRemove,
} from '@storage/storageAuthToken'
import { signOutApp } from './authHelpers'

const api = axios.create({
  baseURL: 'https://iaki-backend-production.up.railway.app',
  timeout: 10000,
})

let isRefreshing = false

type FailedRequest = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let failedQueue: FailedRequest[] = []

api.interceptors.request.use(async (config) => {
  const { token } = await storageAuthTokenGet()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    const tokenExpired =
      error.response?.status === 401 &&
      (error.response?.data as { message?: string })?.message ===
        'token.expired'

    if (tokenExpired && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { refreshToken } = await storageAuthTokenGet()

          const { data } = await api.post('/token/refresh', {
            refreshToken,
          })

          await storageAuthTokenSave({
            token: data.accessToken,
            refreshToken: data.refreshToken,
          })

          api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

          processQueue(null, data.accessToken)

          return api(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)

          await storageAuthTokenRemove()
          signOutApp()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          },
          reject: (err: any) => reject(err),
        })
      })
    }

    if (error.response && error.response.data) {
      return Promise.reject(
        new AppError((error.response.data as { message: string }).message),
      )
    } else {
      return Promise.reject(error)
    }
  },
)

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

export { api }
