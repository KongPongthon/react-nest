import { router } from 'react-query-kit'
import { apiAuthorized, apiLogin, apiOauth, getShortToken } from './api'

export const authQueries = router('auth', {
  authAuthorized: router.mutation({
    mutationFn: apiAuthorized,
  }),
  authLogin: router.mutation({
    mutationFn: apiLogin,
  }),
  authRefresh: router.mutation({
    mutationFn: apiOauth,
  }),
  authShortToken: router.query({
    fetcher: getShortToken,
  }),
})
