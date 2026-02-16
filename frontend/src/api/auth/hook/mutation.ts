import { inferOptions } from 'react-query-kit'
import { authQueries } from '../quries'

export function useAuthAuthorized(
  option?: inferOptions<typeof authQueries.authAuthorized>,
) {
  return authQueries.authAuthorized.useMutation(option)
}

export function useAuthLogin(
  option?: inferOptions<typeof authQueries.authLogin>,
) {
  return authQueries.authLogin.useMutation(option)
}
