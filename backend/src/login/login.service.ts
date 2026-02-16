import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class LoginService {
  constructor() {}
  login(asscessToken: string) {
    try {
      if (!asscessToken) return;
      const options = {
        issuer: 'urn:example:issuer',
        audience: 'urn:example:audience',
      };
      // const JWKS = jose.createRemoteJWKSet(new URL(process.env.JWKS_URL));

      // const { payload, protectedHeader } = await jose.jwtVerify(jwt, JWKS, {
      //   issuer: 'urn:example:issuer',
      //   audience: 'urn:example:audience',
      // });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'An error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
