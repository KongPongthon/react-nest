import { useAuthAuthorized, useAuthLogin } from '@/api/auth/hook/mutation'
import { createFileRoute, useLocation, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'

export const Route = createFileRoute('/_auth/authorized/')({
  component: () => <RouteComponent />,
})
const scopes: string = import.meta.env.VITE_APP_SCOPES
const MSAppIDUri: string = import.meta.env.VITE_MS_APPID_URI

const getScope = (): string => {
  const ns = scopes.split(',').map((item) => {
    return `${MSAppIDUri}${item}`
  })
  return ns.join(' ')
}

function RouteComponent() {
  const location = useLocation()
  const hash = location.hash
  const authAuthorized = useAuthAuthorized()
  const authLogin = useAuthLogin()
  const params = new URLSearchParams(hash)
  const router = useRouter()
  const hasCalled = useRef(false)
  useEffect(() => {
    if (!hash || hasCalled.current) return
    const callAuth = async () => {
      hasCalled.current = true
      await authAuthorized.mutate(
        {
          code: params.get('code') ?? '',
          codeVerifier: localStorage.getItem('code_verifier') ?? '',
          getScope: getScope(),
        },
        {
          onSuccess: async (data) => {
            console.log('TEST OnSuccess', data)
            localStorage.setItem('refresh_token', data.refresh_token)
            await authLogin.mutate(data.access_token, {
              onSuccess: () => {
                router.navigate({ to: `/room`, replace: true })
              },
              onError: () => router.navigate({ to: `/`, replace: true }),
            })
          },
          // router.navigate({ to: `/room`, replace: true })
          onError: () => router.navigate({ to: `/`, replace: true }),
        },
      )
    }

    callAuth()
  }, [hash, authAuthorized, params, router])
  if (!hash) {
    return <div>Unauthorized</div>
  }

  return <div>Loading...</div>
}
