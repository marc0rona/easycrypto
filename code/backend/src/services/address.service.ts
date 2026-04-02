import { CryptoType, Prisma } from '@prisma/client';

import prisma from '../config/prisma';
import {
  AddressCreateResponse,
  MessageResponse,
  UserAddressListResponse,
} from '../types';
import { AppError } from '../utils/AppError';
import { isAddressValidForType } from '../validators/address.validator';

interface CreateAddressInput {
  address?: unknown;
  label?: unknown;
  type?: unknown;
}

interface UpdateAddressInput {
  label?: unknown;
  type?: unknown;
}

interface ExtensionAddressResponse {
  data: {
    id: string;
    address: string;
    type: CryptoType;
  };
  created: boolean;
}

const createBadRequestError = (message: string): AppError =>
  new AppError(message, 400);
const createConflictError = (message: string): AppError =>
  new AppError(message, 409);
const createForbiddenError = (message: string): AppError =>
  new AppError(message, 403);
const createNotFoundError = (message: string): AppError =>
  new AppError(message, 404);

const supportedCryptoTypes = new Set(Object.values(CryptoType));

const normalizeCryptoType = (value: unknown): CryptoType | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  if (!supportedCryptoTypes.has(normalizedValue as CryptoType)) {
    return null;
  }

  return normalizedValue as CryptoType;
};

class AddressService {
  private async ensureUniqueAddress(
    userId: string,
    address: string,
    type: CryptoType,
    excludeAddressId?: string,
  ): Promise<void> {
    const existingAddress = await prisma.cryptoAddress.findFirst({
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

  private async getOwnedAddressOrThrow(
    addressId: string,
    userId: string,
  ): Promise<{ id: string; userId: string; address: string }> {
    const existingAddress = await prisma.cryptoAddress.findUnique({
      where: {
        id: addressId,
      },
      select: {
        id: true,
        address: true,
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

  async getAddresses(userId: string): Promise<UserAddressListResponse> {
    const addresses = await prisma.cryptoAddress.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        address: true,
        label: true,
        type: true,
        createdAt: true,
      },
    });

    return {
      data: addresses,
    };
  }

  async createAddress(
    userId: string,
    input: CreateAddressInput,
  ): Promise<AddressCreateResponse> {
    const address =
      typeof input.address === 'string' ? input.address.trim() : '';
    const type = normalizeCryptoType(input.type);
    const label =
      typeof input.label === 'string'
        ? input.label.trim() || null
        : input.label === undefined
          ? null
          : null;

    if (!address || !type) {
      throw createBadRequestError('Address and type are required');
    }

    if (input.label !== undefined && typeof input.label !== 'string') {
      throw createBadRequestError('Label must be a string');
    }

    if (!isAddressValidForType(address, type)) {
      throw createBadRequestError(`Invalid ${type} address format`);
    }

    await this.ensureUniqueAddress(userId, address, type);

    try {
      const createdAddress = await prisma.cryptoAddress.create({
        data: {
          address,
          label,
          type,
          userId,
        },
        select: {
          id: true,
          address: true,
          label: true,
          type: true,
          createdAt: true,
        },
      });

      return {
        data: createdAddress,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw createConflictError('Address already exists for this user and crypto type');
      }

      throw error;
    }
  }

  async createAddressFromExtension(
    userId: string,
    input: CreateAddressInput,
  ): Promise<ExtensionAddressResponse> {
    const address =
      typeof input.address === 'string' ? input.address.trim() : '';
    const type = normalizeCryptoType(input.type);
    const label =
      typeof input.label === 'string' && input.label.trim()
        ? input.label.trim()
        : 'Imported from extension';

    if (!address || !type) {
      throw createBadRequestError('Address and type are required');
    }

    if (!isAddressValidForType(address, type)) {
      throw createBadRequestError(`Invalid ${type} address format`);
    }

    const existingAddress = await prisma.cryptoAddress.findFirst({
      where: {
        userId,
        address,
        type,
      },
      select: {
        id: true,
        address: true,
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
      const createdAddress = await prisma.cryptoAddress.create({
        data: {
          address,
          type,
          label,
          userId,
        },
        select: {
          id: true,
          address: true,
          type: true,
        },
      });

      return {
        created: true,
        data: createdAddress,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existingDuplicate = await prisma.cryptoAddress.findFirst({
          where: {
            userId,
            address,
            type,
          },
          select: {
            id: true,
            address: true,
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

  async updateAddress(
    addressId: string,
    userId: string,
    input: UpdateAddressInput,
  ): Promise<AddressCreateResponse> {
    const existingAddress = await this.getOwnedAddressOrThrow(addressId, userId);

    const updateData: {
      label?: string | null;
      type?: CryptoType;
    } = {};

    if (input.label !== undefined) {
      if (typeof input.label !== 'string') {
        throw createBadRequestError('Label must be a string');
      }

      updateData.label = input.label.trim() || null;
    }

    if (input.type !== undefined) {
      const type = normalizeCryptoType(input.type);

      if (!type) {
        throw createBadRequestError('Type cannot be empty');
      }

      if (!isAddressValidForType(existingAddress.address, type)) {
        throw createBadRequestError(`Invalid ${type} address format`);
      }

      await this.ensureUniqueAddress(userId, existingAddress.address, type, addressId);

      updateData.type = type;
    }

    try {
      const updatedAddress = await prisma.cryptoAddress.update({
        where: {
          id: addressId,
        },
        data: updateData,
        select: {
          id: true,
          address: true,
          label: true,
          type: true,
          createdAt: true,
        },
      });

      return {
        data: updatedAddress,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw createConflictError('Address already exists for this user and crypto type');
      }

      throw error;
    }
  }

  async deleteAddress(addressId: string, userId: string): Promise<MessageResponse> {
    await this.getOwnedAddressOrThrow(addressId, userId);

    await prisma.cryptoAddress.delete({
      where: {
        id: addressId,
      },
    });

    return {
      message: 'Address deleted successfully',
    };
  }
}

export const addressService = new AddressService();
