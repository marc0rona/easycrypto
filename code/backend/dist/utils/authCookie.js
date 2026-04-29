"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE_NAME = exports.AUTH_COOKIE_NAME = void 0;
exports.setAuthCookie = setAuthCookie;
exports.setRefreshCookie = setRefreshCookie;
exports.clearAuthCookie = clearAuthCookie;
exports.clearRefreshCookie = clearRefreshCookie;
exports.getAuthTokenFromCookieHeader = getAuthTokenFromCookieHeader;
exports.getRefreshTokenFromCookieHeader = getRefreshTokenFromCookieHeader;
const env_1 = require("../config/env");
exports.AUTH_COOKIE_NAME = 'ez_crypt0_access_token';
exports.REFRESH_COOKIE_NAME = 'ez_crypt0_refresh_token';
const durationPattern = /^(\d+)([smhd])$/i;
const durationUnitInMilliseconds = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
};
function parseDurationInMilliseconds(value) {
    const match = value.trim().match(durationPattern);
    if (!match) {
        return undefined;
    }
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    return amount * durationUnitInMilliseconds[unit];
}
function getBaseCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: !env_1.env.isDevelopment,
        path: '/',
    };
}
function getRefreshCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/api/v1/auth',
    };
}
function setAuthCookie(response, token) {
    const maxAge = parseDurationInMilliseconds(env_1.env.jwtExpiresIn);
    response.cookie(exports.AUTH_COOKIE_NAME, token, {
        ...getBaseCookieOptions(),
        ...(maxAge ? { maxAge } : {}),
    });
}
function setRefreshCookie(response, token) {
    const maxAge = parseDurationInMilliseconds(env_1.env.jwtRefreshExpiresIn);
    response.cookie(exports.REFRESH_COOKIE_NAME, token, {
        ...getRefreshCookieOptions(),
        ...(maxAge ? { maxAge } : {}),
    });
}
function clearAuthCookie(response) {
    response.clearCookie(exports.AUTH_COOKIE_NAME, getBaseCookieOptions());
}
function clearRefreshCookie(response) {
    response.clearCookie(exports.REFRESH_COOKIE_NAME, getRefreshCookieOptions());
}
function getTokenFromCookieHeader(cookieName, cookieHeader) {
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
function getAuthTokenFromCookieHeader(cookieHeader) {
    return getTokenFromCookieHeader(exports.AUTH_COOKIE_NAME, cookieHeader);
}
function getRefreshTokenFromCookieHeader(cookieHeader) {
    return getTokenFromCookieHeader(exports.REFRESH_COOKIE_NAME, cookieHeader);
}
