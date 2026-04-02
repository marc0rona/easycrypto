import { CryptoType, Role } from '@prisma/client';

export interface MessageResponse {
  message: string;
}

export interface AddressListItem {
  address: string;
  type: CryptoType;
}

export interface AddressListResponse {
  data: AddressListItem[];
}

export interface AddressRecord {
  id: string;
  address: string;
  label: string | null;
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
