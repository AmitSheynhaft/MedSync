import type { CookieOptions, Request, Response } from 'express';
import type { TokenPair } from './token.service';

export const ACCESS_TOKEN_COOKIE = 'medsync_access_token';
export const REFRESH_TOKEN_COOKIE = 'medsync_refresh_token';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

export function setAuthCookies(res: Response, tokens: TokenPair): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookieOptions(),
    maxAge: FIFTEEN_MINUTES_MS,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions(),
    maxAge: SEVEN_DAYS_MS,
  });
}

export function clearAuthCookies(res: Response): void {
  const options = baseCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
  res.clearCookie(REFRESH_TOKEN_COOKIE, options);
}

export function getAccessTokenFromRequest(req: Request): string | undefined {
  return req.cookies?.[ACCESS_TOKEN_COOKIE];
}

export function getRefreshTokenFromRequest(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE];
}
