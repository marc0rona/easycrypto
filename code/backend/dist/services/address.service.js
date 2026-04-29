"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = require("../utils/AppError");
const address_validator_1 = require("../validators/address.validator");
const createBadRequestError = (message) => new AppError_1.AppError(message, 400);
const createConflictError = (message) => new AppError_1.AppError(message, 409);
const createForbiddenError = (message) => new AppError_1.AppError(message, 403);
const createNotFoundError = (message) => new AppError_1.AppError(message, 404);
const supportedCryptoTypes = new Set(Object.values(client_1.CryptoType));
const supportedAddressDirections = new Set(Object.values(client_1.AddressDirection));
const normalizeCryptoType = (value) => {
    if (typeof value !== 'string') {
        return null;
    }
    const normalizedValue = value.trim().toUpperCase();
    if (!supportedCryptoTypes.has(normalizedValue)) {
        return null;
    }
    return normalizedValue;
};
const normalizeAddressDirection = (value) => {
    if (typeof value !== 'string') {
        return null;
    }
    const normalizedValue = value.trim().toUpperCase();
    if (!supportedAddressDirections.has(normalizedValue)) {
        return null;
    }
    return normalizedValue;
};
class AddressService {
    async ensureUniqueAddress(userId, address, type, excludeAddressId) {
        const existingAddress = await prisma_1.default.cryptoAddress.findFirst({
            where: {
                userId,
                address,
                type,
                ...(excludeAddressId
                    ? {
                        NOT: {
                            id: excludeAddressId,
                        },
                    }
                    : {}),
            },
            select: {
                id: true,
            },
        });
        if (existingAddress) {
            throw createConflictError('Address already exists for this user and crypto type');
        }
    }
    async getOwnedAddressOrThrow(addressId, userId) {
        const existingAddress = await prisma_1.default.cryptoAddress.findUnique({
            where: {
                id: addressId,
            },
            select: {
                id: true,
                address: true,
                direction: true,
                type: true,
                userId: true,
            },
        });
        if (!existingAddress) {
            throw createNotFoundError('Address not found');
        }
        if (existingAddress.userId !== userId) {
            throw createForbiddenError('Forbidden');
        }
        return existingAddress;
    }
    async getAddresses(userId) {
        const addresses = await prisma_1.default.cryptoAddress.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                address: true,
                direction: true,
                label: true,
                type: true,
                createdAt: true,
            },
        });
        return {
            data: addresses,
        };
    }
    async createAddress(userId, input) {
        const address = typeof input.address === 'string' ? input.address.trim() : '';
        const direction = input.direction === undefined
            ? client_1.AddressDirection.RECEIVING
            : normalizeAddressDirection(input.direction);
        const type = normalizeCryptoType(input.type);
        const label = typeof input.label === 'string'
            ? input.label.trim() || null
            : input.label === undefined
                ? null
                : null;
        if (!address || !type || !direction) {
            throw createBadRequestError('Address, type, and direction are required');
        }
        if (input.label !== undefined && typeof input.label !== 'string') {
            throw createBadRequestError('Label must be a string');
        }
        if (!(0, address_validator_1.isAddressValidForType)(address, type)) {
            throw createBadRequestError(`Invalid ${type} address format`);
        }
        await this.ensureUniqueAddress(userId, address, type);
        try {
            const createdAddress = await prisma_1.default.cryptoAddress.create({
                data: {
                    address,
                    direction,
                    label,
                    type,
                    userId,
                },
                select: {
                    id: true,
                    address: true,
                    direction: true,
                    label: true,
                    type: true,
                    createdAt: true,
                },
            });
            return {
                data: createdAddress,
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw createConflictError('Address already exists for this user and crypto type');
            }
            throw error;
        }
    }
    async createAddressFromExtension(userId, input) {
        const address = typeof input.address === 'string' ? input.address.trim() : '';
        const direction = input.direction === undefined
            ? client_1.AddressDirection.RECEIVING
            : normalizeAddressDirection(input.direction);
        const type = normalizeCryptoType(input.type);
        const label = typeof input.label === 'string' && input.label.trim()
            ? input.label.trim()
            : 'Imported from extension';
        if (!address || !type || !direction) {
            throw createBadRequestError('Address, type, and direction are required');
        }
        if (!(0, address_validator_1.isAddressValidForType)(address, type)) {
            throw createBadRequestError(`Invalid ${type} address format`);
        }
        const existingAddress = await prisma_1.default.cryptoAddress.findFirst({
            where: {
                userId,
                address,
                type,
            },
            select: {
                id: true,
                address: true,
                direction: true,
                type: true,
            },
        });
        if (existingAddress) {
            return {
                created: false,
                data: existingAddress,
            };
        }
        try {
            const createdAddress = await prisma_1.default.cryptoAddress.create({
                data: {
                    address,
                    direction,
                    type,
                    label,
                    userId,
                },
                select: {
                    id: true,
                    address: true,
                    direction: true,
                    type: true,
                },
            });
            return {
                created: true,
                data: createdAddress,
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                const existingDuplicate = await prisma_1.default.cryptoAddress.findFirst({
                    where: {
                        userId,
                        address,
                        type,
                    },
                    select: {
                        id: true,
                        address: true,
                        direction: true,
                        type: true,
                    },
                });
                if (existingDuplicate) {
                    return {
                        created: false,
                        data: existingDuplicate,
                    };
                }
            }
            throw error;
        }
    }
    async updateAddress(addressId, userId, input) {
        const existingAddress = await this.getOwnedAddressOrThrow(addressId, userId);
        const updateData = {};
        const nextAddress = input.address === undefined
            ? existingAddress.address
            : typeof input.address === 'string'
                ? input.address.trim()
                : null;
        const nextType = input.type === undefined ? existingAddress.type : normalizeCryptoType(input.type);
        const nextDirection = input.direction === undefined
            ? existingAddress.direction
            : normalizeAddressDirection(input.direction);
        if (input.address !== undefined && !nextAddress) {
            throw createBadRequestError('Address is required');
        }
        if (input.label !== undefined) {
            if (typeof input.label !== 'string') {
                throw createBadRequestError('Label must be a string');
            }
            updateData.label = input.label.trim() || null;
        }
        if (input.type !== undefined) {
            if (!nextType) {
                throw createBadRequestError('Type cannot be empty');
            }
        }
        if (input.direction !== undefined && !nextDirection) {
            throw createBadRequestError('Direction cannot be empty');
        }
        const validatedNextAddress = nextAddress ?? existingAddress.address;
        if (!nextType || !(0, address_validator_1.isAddressValidForType)(validatedNextAddress, nextType)) {
            throw createBadRequestError(`Invalid ${nextType ?? existingAddress.type} address format`);
        }
        if (validatedNextAddress !== existingAddress.address || nextType !== existingAddress.type) {
            await this.ensureUniqueAddress(userId, validatedNextAddress, nextType, addressId);
        }
        if (validatedNextAddress !== existingAddress.address) {
            updateData.address = validatedNextAddress;
        }
        if (nextType !== existingAddress.type) {
            updateData.type = nextType;
        }
        const resolvedNextDirection = nextDirection ?? existingAddress.direction;
        if (resolvedNextDirection !== existingAddress.direction) {
            updateData.direction = resolvedNextDirection;
        }
        try {
            const updatedAddress = await prisma_1.default.cryptoAddress.update({
                where: {
                    id: addressId,
                },
                data: updateData,
                select: {
                    id: true,
                    address: true,
                    direction: true,
                    label: true,
                    type: true,
                    createdAt: true,
                },
            });
            return {
                data: updatedAddress,
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw createConflictError('Address already exists for this user and crypto type');
            }
            throw error;
        }
    }
    async deleteAddress(addressId, userId) {
        await this.getOwnedAddressOrThrow(addressId, userId);
        await prisma_1.default.cryptoAddress.delete({
            where: {
                id: addressId,
            },
        });
        return {
            message: 'Address deleted successfully',
        };
    }
}
exports.addressService = new AddressService();
