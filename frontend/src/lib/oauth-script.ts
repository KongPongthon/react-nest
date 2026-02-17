const scopes: string = import.meta.env.VITE_APP_SCOPES
const MSAppIDUri: string = import.meta.env.VITE_MS_APPID_URI

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

export { getScope, codeVerifier, generateCodeChallenge, generateRandomString }
