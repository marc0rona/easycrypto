"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.updateUserAccount = exports.createAdmin = exports.getUsers = void 0;
const admin_service_1 = require("../services/admin.service");
const AppError_1 = require("../utils/AppError");
const getUsers = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const response = await admin_service_1.adminService.getUsers();
        res.status(200).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const createAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const response = await admin_service_1.adminService.createAdmin(req.body);
        res.status(201).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAdmin = createAdmin;
const updateUserAccount = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const userId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
        if (!userId) {
            next(new AppError_1.AppError('User id is required', 400));
            return;
        }
        const response = await admin_service_1.adminService.updateUserAccount(userId, req.body);
        res.status(200).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserAccount = updateUserAccount;
const updateUserStatus = async (req, res, next) => {
    try {
        if (!req.user) {
            next(new AppError_1.AppError('Unauthorized', 401));
            return;
        }
        const userId = typeof req.params.id === 'string' ? req.params.id.trim() : '';
        if (!userId) {
            next(new AppError_1.AppError('User id is required', 400));
            return;
        }
        const response = await admin_service_1.adminService.updateUserStatus(req.user.id, userId, req.body);
        res.status(200).json({
            success: true,
            ...response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatus = updateUserStatus;
