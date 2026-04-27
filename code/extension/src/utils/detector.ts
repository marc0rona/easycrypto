export type DetectedCryptoType =
  | 'ADA'
  | 'ATOM'
  | 'BTC'
  | 'DOGE'
  | 'DOT'
  | 'ETH'
  | 'LTC'
  | 'SOL'
  | 'TON'
  | 'TRX'
  | 'XRP';

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

export function detectCryptoType(address: string): DetectedCryptoType | null {
  const normalizedAddress = address.trim();

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
