import { client } from '@/config/axios'
import { IApiAuthorized, IApiRefreshToken } from './types'

const clientID: string = import.meta.env.VITE_MS_CLIENT_ID
const MSTokenUrl: string = import.meta.env.VITE_MS_TOKEN_URL
const redirectUrl: string = import.meta.env.VITE_REDIRECT_URI

export const apiOauth = async ({
  refresh_token,
  getScope,
}: IApiRefreshToken) => {
  try {
    const res = await client.post(
      MSTokenUrl,
      {
        client_id: clientID,
        scope: getScope,
        refresh_token: refresh_token,
        grant_type: 'refresh_token',
      },
      {
        enableBearer: false,
        withCredentials: false,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    )
    return res.data
  } catch (error) {
    throw error
  }
}

export const apiAuthorized = async ({
  code,
  codeVerifier,
  getScope,
}: IApiAuthorized) => {
  try {
    const res = await client.post(
      MSTokenUrl,
      {
        grant_type: 'authorization_code',
        scope: getScope,
        code: code,
        client_id: clientID,
        redirect_uri: redirectUrl,
        code_verifier: codeVerifier,
      },
      {
        enableBearer: false,
        withCredentials: false,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    )
    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const apiLogin = async (data: string) => {
  try {
    console.log('API Verify', data, typeof data)
    const res = await client.post(
      '/auth',
      {},
      {
        enableBearer: false,
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${data}`,
        },
      },
    )
    localStorage.setItem('access_token', res.data.data)
    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getShortToken = async () => {
  try {
    const res = await client.get('/auth')
    console.log('res.data', res.data)
    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
