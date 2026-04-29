"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = require("../utils/AppError");
const SALT_ROUNDS = 12;
const createBadRequestError = (message) => new AppError_1.AppError(message, 400);
const createForbiddenError = (message) => new AppError_1.AppError(message, 403);
const createNotFoundError = (message) => new AppError_1.AppError(message, 404);
const adminUserSelect = {
    createdAt: true,
    email: true,
    id: true,
    name: true,
    role: true,
    status: true,
    username: true,
};
class AdminService {
    async getUsers() {
        const users = await prisma_1.default.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            select: adminUserSelect,
        });
        return {
            data: users,
        };
    }
    async createAdmin(input) {
        const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
        const username = typeof input.username === 'string' ? input.username.trim() : '';
        const name = typeof input.name === 'string' ? input.name.trim() : '';
        const password = typeof input.password === 'string' ? input.password : '';
        if (!email || !username || !name || !password.trim()) {
            throw createBadRequestError('Name, username, email, and password are required');
        }
        if (username.length < 3) {
            throw createBadRequestError('Username must be at least 3 characters long');
        }
        if (name.length < 2) {
            throw createBadRequestError('Name must be at least 2 characters long');
        }
        if (password.trim().length < 6) {
            throw createBadRequestError('Password must be at least 6 characters long');
        }
        const [existingEmailUser, existingUsernameUser] = await Promise.all([
            prisma_1.default.user.findUnique({
                where: { email },
                select: { id: true },
            }),
            prisma_1.default.user.findUnique({
                where: { username },
                select: { id: true },
            }),
        ]);
        if (existingEmailUser) {
            throw createBadRequestError('Email already exists');
        }
        if (existingUsernameUser) {
            throw createBadRequestError('Username already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        try {
            const createdAdmin = await prisma_1.default.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role: client_1.Role.ADMIN,
                    status: client_1.Status.ACTIVE,
                    username,
                },
                select: adminUserSelect,
            });
            return {
                data: createdAdmin,
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw createBadRequestError('Email or username already exists');
            }
            throw error;
        }
    }
    async updateUserAccount(userId, input) {
        const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
        const username = typeof input.username === 'string' ? input.username.trim() : '';
        const name = typeof input.name === 'string' ? input.name.trim() : '';
        if (!email || !username || !name) {
            throw createBadRequestError('Name, username, and email are required');
        }
        if (username.length < 3) {
            throw createBadRequestError('Username must be at least 3 characters long');
        }
        if (name.length < 2) {
            throw createBadRequestError('Name must be at least 2 characters long');
        }
        const currentUser = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                id: true,
                username: true,
            },
        });
        if (!currentUser) {
            throw createNotFoundError('User not found');
        }
        const checks = await Promise.all([
            email !== currentUser.email
                ? prisma_1.default.user.findUnique({
                    where: { email },
                    select: { id: true },
                })
                : Promise.resolve(null),
            username !== currentUser.username
                ? prisma_1.default.user.findUnique({
                    where: { username },
                    select: { id: true },
                })
                : Promise.resolve(null),
        ]);
        const [existingEmailUser, existingUsernameUser] = checks;
        if (existingEmailUser && existingEmailUser.id !== userId) {
            throw createBadRequestError('Email already exists');
        }
        if (existingUsernameUser && existingUsernameUser.id !== userId) {
            throw createBadRequestError('Username already exists');
        }
        try {
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    email,
                    name,
                    username,
                },
                select: adminUserSelect,
            });
            return {
                data: updatedUser,
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw createBadRequestError('Email or username already exists');
            }
            throw error;
        }
    }
    async updateUserStatus(adminId, userId, input) {
        const status = typeof input.status === 'string' ? input.status.trim().toUpperCase() : '';
        if (!status) {
            throw createBadRequestError('Status is required');
        }
        if (status !== client_1.Status.ACTIVE && status !== client_1.Status.DISABLED) {
            throw createBadRequestError('Invalid status value');
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
            },
        });
        if (!existingUser) {
            throw createNotFoundError('User not found');
        }
        if (existingUser.id === adminId) {
            throw createBadRequestError('Admin cannot update their own status');
        }
        const updatedUser = await prisma_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                status: status,
            },
            select: adminUserSelect,
        });
        return {
            data: updatedUser,
        };
    }
    async deleteUser() {
        throw createForbiddenError('Deleting users is disabled. Use account status controls instead.');
    }
}
exports.adminService = new AdminService();
