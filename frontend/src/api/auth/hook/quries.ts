import { inferOptions } from 'react-query-kit'
import { authQueries } from '../quries'

export function useGetShortToken(
  option?: inferOptions<typeof authQueries.authShortToken>,
) {
  return authQueries.authShortToken.useQuery(option)
}
