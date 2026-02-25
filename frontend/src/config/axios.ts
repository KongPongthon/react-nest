import { apiLogin, apiOauth } from '@/api/auth/api'
import { API_URL } from '@/constants'
import { getScope } from '@/lib/oauth-script'

import axios from 'axios'
import qs from 'qs'

declare module 'axios' {
  export interface AxiosRequestConfig {
    enableBearer?: boolean
    enableRefreshToken?: boolean
  }
}

export const client = axios.create({
  baseURL: API_URL,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
  enableBearer: true,
  enableRefreshToken: true,
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      const dataOauth = await apiOauth({
        refresh_token: localStorage.getItem('refresh_token') ?? '',
        getScope: getScope(),
      })

      localStorage.setItem('refresh_token', dataOauth.refresh_token)

      await apiLogin(dataOauth.access_token)

      return client.request(error.config)
    }
    return Promise.reject(error)
  },
)

client.interceptors.request.use((config) => {
  if (config.enableBearer) {
    const accessToken = localStorage.getItem('access_token')
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})
