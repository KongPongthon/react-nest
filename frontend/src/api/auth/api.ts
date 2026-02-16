import { client } from '@/config/axios'

const clientID: string = import.meta.env.VITE_MS_CLIENT_ID
const MSTokenUrl: string = import.meta.env.VITE_MS_TOKEN_URL
const redirectUrl: string = import.meta.env.VITE_REDIRECT_URI

interface IApiAuthorized {
  code: string
  codeVerifier: string
  getScope: string
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
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )

    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const apiLogin = async (data: string) => {
  try {
    console.log('TESTDATA', data)

    const res = await client.post('/login')
    return res.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
