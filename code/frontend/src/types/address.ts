export const ADDRESS_TYPES = ['BTC', 'ETH', 'SOL', 'TRX'] as const;

export type AddressType = (typeof ADDRESS_TYPES)[number];

export interface AddressRecord {
  address: string;
  id: string;
  label?: string;
  type: AddressType;
}

export interface AddressFormValues {
  address: string;
  label: string;
  type: AddressType;
}
