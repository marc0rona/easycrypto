export const ADDRESS_TYPES = [
  'BTC',
  'ETH',
  'SOL',
  'LTC',
  'DOGE',
  'XRP',
  'ADA',
  'TON',
  'DOT',
  'TRX',
  'ATOM',
] as const;

export type AddressType = (typeof ADDRESS_TYPES)[number];
export const ADDRESS_DIRECTIONS = ['RECEIVING', 'SENDING'] as const;
export type AddressDirection = (typeof ADDRESS_DIRECTIONS)[number];

export interface AddressRecord {
  address: string;
  createdAt?: string;
  direction: AddressDirection;
  id: string;
  label?: string;
  type: AddressType;
}

export interface AddressFormValues {
  address: string;
  direction: AddressDirection;
  label: string;
  type: AddressType;
}
