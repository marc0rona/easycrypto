"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.updateAuthenticatedUserPassword = exports.updateAuthenticatedUserProfile = exports.getCurrentAuthenticatedUser = exports.refreshUserSession = exports.loginUser = exports.registerUser = void 0;
const auth_service_1 = require("../services/auth.service");
const authCookie_1 = require("../utils/authCookie");
const AppError_1 = require("../utils/AppError");
function sendAuthenticatedSession(res, result, statusCode) {
    (0, authCookie_1.setAuthCookie)(res, result.token);
    (0, authCookie_1.setRefreshCookie)(res, result.refreshToken);
    res.status(statusCode).json({
        success: true,
        data: {
            token: result.token,
            user: result.user,
        },
    });
}
const registerUser = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.registerUser(req.body);
        sendAuthenticatedSession(res, result, 201);
    }
    catch (error) {
        next(error);
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.loginUser(req.body);
        sendAuthenticatedSession(res, result, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.loginUser = loginUser;
const refreshUserSession = async (req, res, next) => {
    try {
        const refreshToken = (0, authCookie_1.getRefreshTokenFromCookieHeader)(req.headers.cookie);
        if (!refreshToken) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const result = await auth_service_1.authService.refreshUserSession(refreshToken);
        sendAuthenticatedSession(res, result, 200);
    }
    catch (error) {
        next(error);
    }
};
exports.refreshUserSession = refreshUserSession;
const getCurrentAuthenticatedUser = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const user = await auth_service_1.authService.getCurrentUser(req.user.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentAuthenticatedUser = getCurrentAuthenticatedUser;
const updateAuthenticatedUserProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const user = await auth_service_1.authService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAuthenticatedUserProfile = updateAuthenticatedUserProfile;
const updateAuthenticatedUserPassword = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        await auth_service_1.authService.changePassword(req.user.id, req.body);
        res.status(200).json({
            success: true,
            data: {
                success: true,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAuthenticatedUserPassword = updateAuthenticatedUserPassword;
const logoutUser = async (_req, res, next) => {
    try {
        (0, authCookie_1.clearAuthCookie)(res);
        (0, authCookie_1.clearRefreshCookie)(res);
        res.status(200).json({
            success: true,
            data: {
                success: true,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutUser = logoutUser;
