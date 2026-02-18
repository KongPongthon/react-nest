import { useAuthAuthorized, useAuthLogin } from '@/api/auth/hook/mutation'
import { getScope } from '@/lib/oauth-script'
import { createFileRoute, useLocation, useRouter } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/_auth/authorized/')({
  component: () => <RouteComponent />,
})

function RouteComponent() {
  const location = useLocation()
  const hash = location.hash
  const authAuthorized = useAuthAuthorized()
  const authLogin = useAuthLogin()
  const params = new URLSearchParams(hash)
  const router = useRouter()
  const hasCalled = useRef(false)

  const callAuth = async () => {
    hasCalled.current = true
    authAuthorized.mutateAsync(
      {
        code: params.get('code') ?? '',
        codeVerifier: localStorage.getItem('code_verifier') ?? '',
        getScope: getScope(),
      },
      {
        onSuccess: async (data) => {
          console.log('TEST OnSuccess', data)
          localStorage.setItem('refresh_token', data.refresh_token)
          authLogin
            .mutateAsync(data.access_token)
            .then(() => router.navigate({ to: '/room', replace: true }))
            .catch(() => router.navigate({ to: `/`, replace: true }))
        },
        onError: () => router.navigate({ to: `/`, replace: true }),
      },
    )
  }
  useEffect(() => {
    if (!hash || hasCalled.current) return
    callAuth()
  }, [hash, authAuthorized, params, router])
  if (!hash) {
    return <div>Unauthorized</div>
  }

  return <div>Loading...</div>
}
