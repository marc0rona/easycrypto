"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authCookie_1 = require("../utils/authCookie");
const AppError_1 = require("../utils/AppError");
const createUnauthorizedError = () => new AppError_1.AppError('Unauthorized', 401);
const authenticate = (req, _res, next) => {
    const authorizationHeader = req.headers.authorization;
    const cookieToken = (0, authCookie_1.getAuthTokenFromCookieHeader)(req.headers.cookie);
    const token = authorizationHeader?.startsWith('Bearer ')
        ? authorizationHeader.slice('Bearer '.length).trim()
        : cookieToken;
    if (!token) {
        next(createUnauthorizedError());
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtSecret);
        if (typeof decoded !== 'object' ||
            decoded === null ||
            !('userId' in decoded) ||
            !('role' in decoded)) {
            next(createUnauthorizedError());
            return;
        }
        const payload = decoded;
        if (typeof payload.userId !== 'string' ||
            (payload.role !== 'USER' && payload.role !== 'ADMIN')) {
            next(createUnauthorizedError());
            return;
        }
        const authenticatedUser = {
            id: payload.userId,
            role: payload.role,
        };
        req.user = authenticatedUser;
    }
    catch (_error) {
        next(createUnauthorizedError());
        return;
    }
    next();
};
exports.authenticate = authenticate;
