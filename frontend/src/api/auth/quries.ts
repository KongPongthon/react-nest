import { router } from 'react-query-kit'
import { apiAuthorized, apiLogin } from './api'

export const authQueries = router('auth', {
  authAuthorized: router.mutation({
    mutationFn: apiAuthorized,
  }),
  authLogin: router.mutation({
    mutationFn: apiLogin,
  }),
})
