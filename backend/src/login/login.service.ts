import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jose from 'jose';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class LoginService {
  private readonly jwks: ReturnType<typeof jose.createRemoteJWKSet>;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly secret: string;

  constructor() {
    const jwksUrl = process.env.JWKS_URL;
    if (!jwksUrl) throw new Error('JWKS_URL is not defined in env');

    this.jwks = jose.createRemoteJWKSet(new URL(jwksUrl));
    this.issuer = process.env.iss ?? '';
    this.audience = process.env.aud ?? '';
    this.secret = process.env.JWT_SECRET ?? '';
  }

  async login(accessToken: string) {
    try {
      console.log('accessToken', accessToken);

      if (!accessToken)
        throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
      if (typeof accessToken !== 'string') {
        throw new Error('Invalid token format: Token must be a string');
      }

      const payload = await this.verifyJose(accessToken);
      // console.log('Login สำเร็จ', payload);

      return payload;
    } catch (error) {
      console.error('Login Error:', error);
      throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
    }
  }

  // ปรับชื่อให้สื่อสารชัดเจน และรับค่าผ่าน parameter
  private async verifyJose(jwt: string) {
    if (!jwt) throw new Error('Token is not defined');
    const { payload } = await jose.jwtVerify(jwt, this.jwks, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return payload;
  }

  JWTGenerate(data: { name: string; id: string }): string {
    console.log('JWT Generate');

    console.log('JWT Generate secret', this.secret);
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in env');
    }
    try {
      console.log('JWTGenerate', data);
      const accessToken = jwt.sign(
        { name: data.name, id: data.id },
        this.secret,
        {
          expiresIn: '3m',
          algorithm: 'HS256',
        },
      );
      return accessToken;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to generate JWT token');
    }
  }

  public verify(token: string): boolean {
    try {
      jwt.verify(token, this.secret);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
