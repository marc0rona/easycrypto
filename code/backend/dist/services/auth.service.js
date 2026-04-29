"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = require("../utils/AppError");
const SALT_ROUNDS = 12;
const createBadRequestError = (message) => new AppError_1.AppError(message, 400);
const createUnauthorizedError = (message) => new AppError_1.AppError(message, 401);
const createForbiddenError = (message) => new AppError_1.AppError(message, 403);
class AuthService {
    createAccessToken(userId, role) {
        return jsonwebtoken_1.default.sign({
            userId,
            role,
            tokenType: 'access',
        }, env_1.env.jwtSecret, {
            expiresIn: env_1.env.jwtExpiresIn,
        });
    }
    createRefreshToken(userId, role) {
        return jsonwebtoken_1.default.sign({
            userId,
            role,
            tokenType: 'refresh',
        }, env_1.env.jwtRefreshSecret, {
            expiresIn: env_1.env.jwtRefreshExpiresIn,
        });
    }
    createSession(user) {
        return {
            token: this.createAccessToken(user.id, user.role),
            refreshToken: this.createRefreshToken(user.id, user.role),
            user,
        };
    }
    assertUserStatus(status) {
        if (status === client_1.Status.DISABLED) {
            throw createForbiddenError('User account is disabled');
        }
        if (status === client_1.Status.BANNED) {
            throw createForbiddenError('User account is banned');
        }
    }
    async getCurrentSafeUser(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                role: true,
                status: true,
            },
        });
        if (!user) {
            throw createUnauthorizedError('Unauthorized');
        }
        this.assertUserStatus(user.status);
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
        };
    }
    async registerUser(input) {
        const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
        const username = typeof input.username === 'string' ? input.username.trim() : '';
        const name = typeof input.name === 'string' && input.name.trim()
            ? input.name.trim()
            : username;
        const password = typeof input.password === 'string' ? input.password : '';
        if (!email || !username || !name || !password.trim()) {
            throw createBadRequestError('Email, username, and password are required');
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
            const createdUser = await prisma_1.default.user.create({
                data: {
                    email,
                    name,
                    username,
                    password: hashedPassword,
                    role: client_1.Role.USER,
                    status: client_1.Status.ACTIVE,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    role: true,
                },
            });
            return this.createSession(createdUser);
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw createBadRequestError('Email or username already exists');
            }
            throw error;
        }
    }
    async loginUser(input) {
        const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
        const password = typeof input.password === 'string' ? input.password : '';
        if (!email || !password.trim()) {
            throw createBadRequestError('Email and password are required');
        }
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                username: true,
                password: true,
                role: true,
                status: true,
            },
        });
        if (!user) {
            throw createUnauthorizedError('Invalid credentials');
        }
        const passwordMatches = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatches) {
            throw createUnauthorizedError('Invalid credentials');
        }
        this.assertUserStatus(user.status);
        return this.createSession({
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
        });
    }
    async refreshUserSession(refreshToken) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwtRefreshSecret);
        }
        catch (_error) {
            throw createUnauthorizedError('Unauthorized');
        }
        if (typeof payload.userId !== 'string' ||
            payload.tokenType !== 'refresh' ||
            (payload.role !== client_1.Role.USER && payload.role !== client_1.Role.ADMIN)) {
            throw createUnauthorizedError('Unauthorized');
        }
        const user = await this.getCurrentSafeUser(payload.userId);
        return this.createSession(user);
    }
    async getCurrentUser(userId) {
        return this.getCurrentSafeUser(userId);
    }
    async updateProfile(userId, input) {
        const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
        const name = typeof input.name === 'string' ? input.name.trim() : '';
        if (!email || !name) {
            throw createBadRequestError('Email and name are required');
        }
        const currentUser = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                id: true,
                status: true,
            },
        });
        if (!currentUser) {
            throw createUnauthorizedError('Unauthorized');
        }
        this.assertUserStatus(currentUser.status);
        if (email !== currentUser.email) {
            const existingEmailUser = await prisma_1.default.user.findUnique({
                where: { email },
                select: { id: true },
            });
            if (existingEmailUser && existingEmailUser.id !== userId) {
                throw createBadRequestError('Email already exists');
            }
        }
        try {
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    email,
                    name,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    username: true,
                    role: true,
                },
            });
            return updatedUser;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw createBadRequestError('Email already exists');
            }
            throw error;
        }
    }
    async changePassword(userId, input) {
        const currentPassword = typeof input.currentPassword === 'string' ? input.currentPassword : '';
        const newPassword = typeof input.newPassword === 'string' ? input.newPassword : '';
        if (!currentPassword.trim() || !newPassword.trim()) {
            throw createBadRequestError('Current password and new password are required');
        }
        if (newPassword.trim().length < 6) {
            throw createBadRequestError('Password must be at least 6 characters long');
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password: true,
                status: true,
            },
        });
        if (!user) {
            throw createUnauthorizedError('Unauthorized');
        }
        this.assertUserStatus(user.status);
        const passwordMatches = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!passwordMatches) {
            throw createUnauthorizedError('Current password is incorrect');
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, SALT_ROUNDS);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });
    }
}
exports.authService = new AuthService();
