import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jose from 'jose';
import * as jwt from 'jsonwebtoken';
import { IAuth, IGenerateToken, IJWT } from './auth.interface';

@Injectable()
export class AuthService {
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

  async login({ token }: IAuth) {
    console.log('token', token);

    try {
      if (!token)
        throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
      if (typeof token !== 'string') {
        throw new Error('Invalid token format: Token must be a string');
      }
      const payload = await this.verifyJose({ jwt: token });
      return payload;
    } catch (error) {
      console.error('Login Error:', error);
      throw new UnauthorizedException('Token ไม่ถูกต้อง หรือหมดอายุ');
    }
  }

  // ปรับชื่อให้สื่อสารชัดเจน และรับค่าผ่าน parameter
  private async verifyJose({ jwt }: IJWT) {
    if (!jwt) throw new Error('Token is not defined');
    const { payload } = await jose.jwtVerify(jwt, this.jwks, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return payload;
  }

  JWTGenerate(data: IGenerateToken): string {
    // console.log('JWT Generate');

    // console.log('JWT Generate secret', this.secret);
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in env');
    }
    try {
      const accessToken = jwt.sign(
        { name: data.name, id: data.id, email: data.email },
        this.secret,
      );
      return accessToken;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to generate JWT token');
    }
  }

  GenerateShortToken(data: IGenerateToken) {
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in env');
    }
    try {
      const access_token = jwt.sign(
        { name: data.name, id: data.id, email: data.email },
        this.secret,
        {
          expiresIn: '10s',
        },
      );
      return access_token;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to generate JWT token');
    }
  }

  verify(token: string): IGenerateToken | null {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined in env');
      }
      const payload = jwt.verify(token, secret) as IGenerateToken;
      return payload;
    } catch (errors) {
      console.error('JWT Verification failed:', errors);
      return null;
    }
  }
}
