export interface IApiAuthorized {
  code: string
  codeVerifier: string
  getScope: string
}

export interface IApiRefreshToken {
  refresh_token: string
  getScope: string
}
