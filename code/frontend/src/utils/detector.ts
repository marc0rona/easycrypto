import type { AddressType } from '../types/address';

const ADA_REGEX =
  /^(?:addr1[0-9a-z]{20,}|Ae2[1-9A-HJ-NP-Za-km-z]{20,}|DdzFF[1-9A-HJ-NP-Za-km-z]{20,})$/;
const ATOM_REGEX = /^cosmos1[0-9a-z]{38}$/;
const ETH_REGEX = /^0x[a-fA-F0-9]{40}$/;
const BTC_REGEX = /^(?:bc1[a-zA-HJ-NP-Z0-9]{23,39}|[13][a-km-zA-HJ-NP-Z1-9]{25,41})$/i;
const DOGE_REGEX = /^(?:D|A|9)[a-km-zA-HJ-NP-Z1-9]{33}$/;
const DOT_REGEX = /^1[1-9A-HJ-NP-Za-km-z]{47}$/;
const XRP_REGEX = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;
const LTC_REGEX = /^(?:ltc1[a-zA-HJ-NP-Z0-9]{23,39}|[LM][a-km-zA-HJ-NP-Z1-9]{25,41})$/i;
const SOL_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const TON_REGEX = /^(?:EQ|UQ|kQ|0Q)[A-Za-z0-9_-]{46}$/;
const TRX_REGEX = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

const VALIDATION_REGEX_BY_TYPE: Record<AddressType, RegExp> = {
  ADA: ADA_REGEX,
  ATOM: ATOM_REGEX,
  BTC: BTC_REGEX,
  DOGE: DOGE_REGEX,
  DOT: DOT_REGEX,
  ETH: ETH_REGEX,
  LTC: LTC_REGEX,
  SOL: SOL_REGEX,
  TON: TON_REGEX,
  TRX: TRX_REGEX,
  XRP: XRP_REGEX,
};

export function normalizeAddress(value: string) {
  return value.trim();
}

export function normalizeAddressForComparison(value: string) {
  return normalizeAddress(value).toLowerCase();
}

export function detectCryptoType(address: string): AddressType | null {
  const normalizedAddress = normalizeAddress(address);

  if (!normalizedAddress) {
    return null;
  }

  if (ETH_REGEX.test(normalizedAddress)) {
    return 'ETH';
  }

  if (BTC_REGEX.test(normalizedAddress)) {
    return 'BTC';
  }

  if (ADA_REGEX.test(normalizedAddress)) {
    return 'ADA';
  }

  if (ATOM_REGEX.test(normalizedAddress)) {
    return 'ATOM';
  }

  if (DOGE_REGEX.test(normalizedAddress)) {
    return 'DOGE';
  }

  if (DOT_REGEX.test(normalizedAddress)) {
    return 'DOT';
  }

  if (TON_REGEX.test(normalizedAddress)) {
    return 'TON';
  }

  if (TRX_REGEX.test(normalizedAddress)) {
    return 'TRX';
  }

  if (XRP_REGEX.test(normalizedAddress)) {
    return 'XRP';
  }

  if (LTC_REGEX.test(normalizedAddress)) {
    return 'LTC';
  }

  if (SOL_REGEX.test(normalizedAddress)) {
    return 'SOL';
  }

  return null;
}

export function isValidCryptoAddress(address: string, type: AddressType) {
  return VALIDATION_REGEX_BY_TYPE[type].test(normalizeAddress(address));
}

export function getDisplayAddressLabel(label?: string | null) {
  const trimmedLabel = label?.trim();
  return trimmedLabel ? trimmedLabel : 'Unnamed Address';
}

export function truncateAddress(address: string, start = 8, end = 6) {
  if (address.length <= start + end + 3) {
    return address;
  }

  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
