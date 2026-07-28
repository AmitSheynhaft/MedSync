import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { requireEnv } from '../common/config/require-env';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type TokenType = 'access' | 'refresh';
type JwtExpiresIn = NonNullable<SignOptions['expiresIn']>;

export interface TokenPayload {
  sub: string;
  type: TokenType;
  issuedAt?: number;
  expiresAt?: number;
}

interface RawJwtPayload {
  sub?: string;
  type?: TokenType;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: JwtExpiresIn;
  private readonly refreshExpiresIn: JwtExpiresIn;

  constructor(private readonly jwtService: JwtService) {
    this.accessSecret = requireEnv('JWT_SECRET');
    this.refreshSecret = requireEnv('JWT_REFRESH_SECRET');
    this.accessExpiresIn =
      (process.env.JWT_EXPIRES_IN || '15m') as JwtExpiresIn;
    this.refreshExpiresIn =
      (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as JwtExpiresIn;
  }

  generateTokenPair(userId: string): TokenPair {
    return {
      accessToken: this.issueAccessToken(userId),
      refreshToken: this.issueRefreshToken(userId),
    };
  }

  issueAccessToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'access' },
      { secret: this.accessSecret, expiresIn: this.accessExpiresIn },
    );
  }

  issueRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn },
    );
  }

  verifyAccessToken(token: string): TokenPayload {
    return this.verify(token, this.accessSecret, 'access');
  }

  verifyRefreshToken(token: string): TokenPayload {
    return this.verify(token, this.refreshSecret, 'refresh');
  }

  private verify(
    token: string,
    secret: string,
    expected: TokenType,
  ): TokenPayload {
    let raw: RawJwtPayload;
    try {
      raw = this.jwtService.verify<RawJwtPayload>(token, { secret });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
    if (raw?.type !== expected || !raw.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      sub: raw.sub,
      type: raw.type,
      issuedAt: raw.iat,
      expiresAt: raw.exp,
    };
  }
}
