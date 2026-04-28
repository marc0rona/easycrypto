import { AddressDirection, CryptoType, Prisma } from '@prisma/client';

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
  direction?: unknown;
  label?: unknown;
  type?: unknown;
}

interface UpdateAddressInput {
  address?: unknown;
  direction?: unknown;
  label?: unknown;
  type?: unknown;
}

interface ExtensionAddressResponse {
  data: {
    id: string;
    address: string;
    direction: AddressDirection;
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
const supportedAddressDirections = new Set(Object.values(AddressDirection));

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

const normalizeAddressDirection = (value: unknown): AddressDirection | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim().toUpperCase();

  if (!supportedAddressDirections.has(normalizedValue as AddressDirection)) {
    return null;
  }

  return normalizedValue as AddressDirection;
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
  ): Promise<{
    id: string;
    userId: string;
    address: string;
    direction: AddressDirection;
    type: CryptoType;
  }> {
    const existingAddress = await prisma.cryptoAddress.findUnique({
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

  async getAddresses(userId: string): Promise<UserAddressListResponse> {
    const addresses = await prisma.cryptoAddress.findMany({
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

  async createAddress(
    userId: string,
    input: CreateAddressInput,
  ): Promise<AddressCreateResponse> {
    const address =
      typeof input.address === 'string' ? input.address.trim() : '';
    const direction =
      input.direction === undefined
        ? AddressDirection.RECEIVING
        : normalizeAddressDirection(input.direction);
    const type = normalizeCryptoType(input.type);
    const label =
      typeof input.label === 'string'
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

    if (!isAddressValidForType(address, type)) {
      throw createBadRequestError(`Invalid ${type} address format`);
    }

    await this.ensureUniqueAddress(userId, address, type);

    try {
      const createdAddress = await prisma.cryptoAddress.create({
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
    const direction =
      input.direction === undefined
        ? AddressDirection.RECEIVING
        : normalizeAddressDirection(input.direction);
    const type = normalizeCryptoType(input.type);
    const label =
      typeof input.label === 'string' && input.label.trim()
        ? input.label.trim()
        : 'Imported from extension';

    if (!address || !type || !direction) {
      throw createBadRequestError('Address, type, and direction are required');
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
      const createdAddress = await prisma.cryptoAddress.create({
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

  async updateAddress(
    addressId: string,
    userId: string,
    input: UpdateAddressInput,
  ): Promise<AddressCreateResponse> {
    const existingAddress = await this.getOwnedAddressOrThrow(addressId, userId);

    const updateData: {
      address?: string;
      direction?: AddressDirection;
      label?: string | null;
      type?: CryptoType;
    } = {};

    const nextAddress =
      input.address === undefined
        ? existingAddress.address
        : typeof input.address === 'string'
          ? input.address.trim()
          : null;
    const nextType =
      input.type === undefined ? existingAddress.type : normalizeCryptoType(input.type);
    const nextDirection =
      input.direction === undefined
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

    if (!nextType || !isAddressValidForType(validatedNextAddress, nextType)) {
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
      const updatedAddress = await prisma.cryptoAddress.update({
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
