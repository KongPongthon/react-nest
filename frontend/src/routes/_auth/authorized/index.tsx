import { useAuthAuthorized, useAuthLogin } from '@/api/auth/hook/mutation'
import { getScope } from '@/lib/oauth-script'
import { useAuthStore } from '@/store/auth-store'
import { createFileRoute, useLocation, useRouter } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'

export const Route = createFileRoute('/_auth/authorized/')({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()
  const authAuthorized = useAuthAuthorized()
  const authLogin = useAuthLogin()
  const hasCalled = useRef(false)

  const params = useMemo(
    () => new URLSearchParams(location.hash),
    [location.hash],
  )

  useEffect(() => {
    const code = params.get('code')

    if (!code || hasCalled.current) return

    hasCalled.current = true

    const handleAuth = async () => {
      try {
        const data = await authAuthorized.mutateAsync({
          code,
          codeVerifier: localStorage.getItem('code_verifier') ?? '',
          getScope: getScope(),
        })

        localStorage.setItem('refresh_token', data.refresh_token)

        const dataLogin = await authLogin.mutateAsync(data.access_token)
        console.log('dataLogin', dataLogin)
        useAuthStore.getState().setUser(dataLogin.user)
        router.navigate({ to: '/poker', replace: true })
      } catch {
        router.navigate({ to: '/', replace: true })
      }
    }

    handleAuth()
  }, [params])

  return null
}
