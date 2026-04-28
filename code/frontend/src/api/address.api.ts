import type { AddressFormValues, AddressRecord } from '../types/address';

import { apiClient } from './client';

export type CreateAddressPayload = AddressFormValues;
export type UpdateAddressPayload = AddressFormValues;

export interface DeleteAddressResponse {
  id: string;
  success: boolean;
}

interface ApiResponse<TData> {
  data: TData;
  success: boolean;
}

interface BackendAddressRecord {
  address: string;
  createdAt: string;
  direction: AddressRecord['direction'];
  id: string;
  label: string | null;
  type: AddressRecord['type'];
}

function mapAddressRecord(address: BackendAddressRecord): AddressRecord {
  return {
    id: address.id,
    label: address.label ?? undefined,
    address: address.address,
    direction: address.direction,
    type: address.type,
    createdAt: address.createdAt,
  };
}

export async function getAddresses() {
  const response = await apiClient.get<ApiResponse<BackendAddressRecord[]>>('/addresses');

  return response.data.data.map(mapAddressRecord);
}

export async function createAddress(data: CreateAddressPayload) {
  const response = await apiClient.post<ApiResponse<BackendAddressRecord>>('/addresses', {
    address: data.address.trim(),
    direction: data.direction,
    label: data.label.trim() || undefined,
    type: data.type,
  });

  return mapAddressRecord(response.data.data);
}

export async function updateAddress(id: string, data: UpdateAddressPayload) {
  const response = await apiClient.patch<ApiResponse<BackendAddressRecord>>(`/addresses/${id}`, {
    address: data.address.trim(),
    direction: data.direction,
    label: data.label.trim() || undefined,
    type: data.type,
  });

  return mapAddressRecord(response.data.data);
}

export async function deleteAddress(id: string) {
  await apiClient.delete<ApiResponse<{ id: string }>>(`/addresses/${id}`);

  return {
    id,
    success: true,
  } satisfies DeleteAddressResponse;
}
