import { Button } from '@/components/button'
import {
  clientID,
  codeVerifier,
  generateCodeChallenge,
  generateRandomString,
  getScope,
  MSAuthUrl,
  redirectUrl,
} from '@/lib/oauth-script'

const LoginPage = () => {
  const handleLogin = async () => {
    try {
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      const state = generateRandomString(16)
      const nonce = generateRandomString(16)
      localStorage.setItem('state', state)
      localStorage.setItem('nonce', nonce)
      localStorage.setItem('code_verifier', codeVerifier)
      localStorage.setItem('code_challenge', codeChallenge)

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
