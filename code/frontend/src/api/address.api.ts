import type { AddressFormValues, AddressRecord } from '../types/address';

import { resolveMock } from './client';

export type CreateAddressPayload = AddressFormValues;
export type UpdateAddressPayload = AddressFormValues;

export interface DeleteAddressResponse {
  id: string;
  success: boolean;
}

let mockAddresses: AddressRecord[] = [
  {
    id: 'addr-1',
    label: 'Primary trading',
    address: '0x7C4F8A1D2B3C4D5E6F7089A1B2C3D4E58B2D1172',
    type: 'ETH',
  },
  {
    id: 'addr-2',
    label: 'Cold wallet',
    address: 'bc1q0m89s4nq4h2aq4x7s5h0n6e6m4a92k0zhm9f8r',
    type: 'BTC',
  },
  {
    id: 'addr-3',
    label: 'Operations',
    address: 'So11111111111111111111111111111111111111112',
    type: 'SOL',
  },
];

function cloneAddress(address: AddressRecord): AddressRecord {
  return { ...address };
}

function cloneAddresses(addresses: AddressRecord[]): AddressRecord[] {
  return addresses.map(cloneAddress);
}

export async function getAddresses() {
  return resolveMock(cloneAddresses(mockAddresses));
}

export async function createAddress(data: CreateAddressPayload) {
  const nextAddress: AddressRecord = {
    id: `addr-${Date.now()}`,
    label: data.label.trim() || undefined,
    address: data.address.trim(),
    type: data.type,
  };

  mockAddresses = [nextAddress, ...mockAddresses];

  return resolveMock(cloneAddress(nextAddress));
}

export async function updateAddress(id: string, data: UpdateAddressPayload) {
  let updatedAddress: AddressRecord | null = null;

  mockAddresses = mockAddresses.map((address) => {
    if (address.id !== id) {
      return address;
    }

    updatedAddress = {
      ...address,
      label: data.label.trim() || undefined,
      address: data.address.trim(),
      type: data.type,
    };

    return updatedAddress;
  });

  return resolveMock(cloneAddress(updatedAddress ?? mockAddresses[0]));
}

export async function deleteAddress(id: string) {
  mockAddresses = mockAddresses.filter((address) => address.id !== id);

  return resolveMock<DeleteAddressResponse>({
    id,
    success: true,
  });
}
