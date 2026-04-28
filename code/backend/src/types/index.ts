import { AddressDirection, CryptoType, Role } from '@prisma/client';

export interface MessageResponse {
  message: string;
}

export interface AddressListItem {
  address: string;
  direction: AddressDirection;
  type: CryptoType;
}

export interface AddressListResponse {
  data: AddressListItem[];
}

export interface AddressRecord {
  id: string;
  address: string;
  label: string | null;
  direction: AddressDirection;
  type: CryptoType;
  createdAt: Date;
}

export interface AddressCreateResponse {
  data: AddressRecord;
}

export interface UserAddressListResponse {
  data: AddressRecord[];
}

export interface AuthenticatedUser {
  id: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
