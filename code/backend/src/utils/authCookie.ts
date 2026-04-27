import type { CookieOptions, Response } from 'express';

import { env } from '../config/env';

export const AUTH_COOKIE_NAME = 'ez_crypt0_access_token';
export const REFRESH_COOKIE_NAME = 'ez_crypt0_refresh_token';

const durationPattern = /^(\d+)([smhd])$/i;
const durationUnitInMilliseconds = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

function parseDurationInMilliseconds(value: string): number | undefined {
  const match = value.trim().match(durationPattern);

  if (!match) {
    return undefined;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase() as keyof typeof durationUnitInMilliseconds;

  return amount * durationUnitInMilliseconds[unit];
}

function getBaseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: !env.isDevelopment,
    path: '/',
  };
}

function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/api/v1/auth',
  };
}

export function setAuthCookie(response: Response, token: string): void {
  const maxAge = parseDurationInMilliseconds(env.jwtExpiresIn);

  response.cookie(AUTH_COOKIE_NAME, token, {
    ...getBaseCookieOptions(),
    ...(maxAge ? { maxAge } : {}),
  });
}

export function setRefreshCookie(response: Response, token: string): void {
  const maxAge = parseDurationInMilliseconds(env.jwtRefreshExpiresIn);

  response.cookie(REFRESH_COOKIE_NAME, token, {
    ...getRefreshCookieOptions(),
    ...(maxAge ? { maxAge } : {}),
  });
}

export function clearAuthCookie(response: Response): void {
  response.clearCookie(AUTH_COOKIE_NAME, getBaseCookieOptions());
}

export function clearRefreshCookie(response: Response): void {
  response.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
}

function getTokenFromCookieHeader(
  cookieName: typeof AUTH_COOKIE_NAME | typeof REFRESH_COOKIE_NAME,
  cookieHeader?: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  if (!cookie) {
    return null;
  }

  const token = cookie.slice(`${cookieName}=`.length).trim();

  return token ? decodeURIComponent(token) : null;
}

export function getAuthTokenFromCookieHeader(cookieHeader?: string): string | null {
  return getTokenFromCookieHeader(AUTH_COOKIE_NAME, cookieHeader);
}

export function getRefreshTokenFromCookieHeader(cookieHeader?: string): string | null {
  return getTokenFromCookieHeader(REFRESH_COOKIE_NAME, cookieHeader);
}
