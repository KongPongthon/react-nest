export interface JWTPayload {
  aud: string;
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  acr: string;
  aio: string;
  amr: [string];
  appid: string;
  appidacr: string;
  email: string;
  family_name: string;
  given_name: string;
  ipaddr: string;
  name: string;
  oid: string;
  rh: string;
  scp: string;
  sid: string;
  sub: string;
  tid: string;
  unique_name: string;
  upn: string;
  uti: string;
  ver: string;
  xms_ftd: string;
}

export interface IAuth {
  token: string;
}

export interface IJWT {
  jwt: string;
}

export interface IGenerateToken {
  name: string;
  id: string;
  email: string;
}
