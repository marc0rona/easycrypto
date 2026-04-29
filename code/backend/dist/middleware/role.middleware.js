"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const AppError_1 = require("../utils/AppError");
const createUnauthorizedError = () => new AppError_1.AppError('Unauthorized', 401);
const createForbiddenError = () => new AppError_1.AppError('Forbidden', 403);
const requireRole = (requiredRole) => (req, _res, next) => {
    if (!req.user) {
        next(createUnauthorizedError());
        return;
    }
    if (req.user.role !== requiredRole) {
        next(createForbiddenError());
        return;
    }
    next();
};
exports.requireRole = requireRole;
