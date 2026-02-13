import { Button } from '@/components/ui/button'

const MSAuthUrl: string = import.meta.env.VITE_MS_AUTH_URL
const MSAppIDUri: string = import.meta.env.VITE_MS_APPID_URI
const redirectUrl: string = import.meta.env.VITE_REDIRECT_URI
const clientID: string = import.meta.env.VITE_MS_CLIENT_ID
const scopes: string = import.meta.env.VITE_APP_SCOPES

const getScope = (): string => {
  const ns = scopes.split(',').map((item) => {
    return `${MSAppIDUri}${item}`
  })
  return ns.join(' ')
}

// Generate random code verifier (43-128 characters)
const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate code challenge using SHA256 and base64url encoding
const codeVerifier: string = generateRandomString(
  Math.floor(Math.random() * (128 - 43 + 1)) + 43,
)

// Generate code challenge using Web Crypto API (browser-compatible)
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // Convert to base64url
  const base64String = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

const LoginPage = () => {
  const handleLogin = async () => {
    try {
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      const state = generateRandomString(16)
      const param = new URLSearchParams({
        client_id: clientID,
        response_type: 'code',
        redirect_url: redirectUrl,
        response_mode: 'fragment',
        scope: getScope(),
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      })
      location.href = `${MSAuthUrl}?${param.toString()}`
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div>
      <Button
        onClick={handleLogin}
        className="border rounded-lg hover:cursor-pointer"
      >
        Login OAuth
      </Button>
    </div>
  )
}

export default LoginPage
