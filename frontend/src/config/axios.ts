import { API_URL } from '@/constants'

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
