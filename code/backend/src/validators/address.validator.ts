import { AddressDirection, CryptoType } from '@prisma/client';
import { z } from 'zod';

const SUPPORTED_ADDRESS_TYPES = [
  CryptoType.BTC,
  CryptoType.ETH,
  CryptoType.SOL,
  CryptoType.LTC,
  CryptoType.DOGE,
  CryptoType.XRP,
  CryptoType.ADA,
  CryptoType.TON,
  CryptoType.DOT,
  CryptoType.TRX,
  CryptoType.ATOM,
] as const;
type SupportedAddressType = (typeof SUPPORTED_ADDRESS_TYPES)[number];

const adaAddressRegex =
  /^(?:addr1[0-9a-z]{20,}|Ae2[1-9A-HJ-NP-Za-km-z]{20,}|DdzFF[1-9A-HJ-NP-Za-km-z]{20,})$/;
const atomAddressRegex = /^cosmos1[0-9a-z]{38}$/;
const btcAddressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;
const dotAddressRegex = /^1[1-9A-HJ-NP-Za-km-z]{47}$/;
const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
const solAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const ltcAddressRegex = /^(ltc1|[LM3])[a-km-zA-HJ-NP-Z1-9]{26,39}$/;
const dogeAddressRegex = /^(D|A|9)[a-km-zA-HJ-NP-Z1-9]{33}$/;
const tonAddressRegex = /^(?:EQ|UQ|kQ|0Q)[A-Za-z0-9_-]{46}$/;
const trxAddressRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const xrpAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;

const supportedTypeMessage = `Type must be one of ${SUPPORTED_ADDRESS_TYPES.join(', ')}`;
const supportedDirectionMessage = `Direction must be one of ${Object.values(AddressDirection).join(', ')}`;

const cryptoTypeSchema = z
  .string()
  .transform((value) => value.trim().toUpperCase())
  .refine(
    (value): value is SupportedAddressType =>
      SUPPORTED_ADDRESS_TYPES.includes(value as SupportedAddressType),
    supportedTypeMessage,
  );

const addressFieldSchema = z.string().trim().min(1, 'Address is required');
const labelSchema = z.string().trim().optional();
const directionSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine(
    (value): value is AddressDirection =>
      Object.values(AddressDirection).includes(value as AddressDirection),
    supportedDirectionMessage,
  );

export const isAddressValidForType = (
  address: string,
  type: SupportedAddressType,
): boolean => {
  switch (type) {
    case CryptoType.BTC:
      return btcAddressRegex.test(address);
    case CryptoType.ETH:
      return ethAddressRegex.test(address);
    case CryptoType.ADA:
      return adaAddressRegex.test(address);
    case CryptoType.ATOM:
      return atomAddressRegex.test(address);
    case CryptoType.DOT:
      return dotAddressRegex.test(address);
    case CryptoType.SOL:
      return solAddressRegex.test(address);
    case CryptoType.LTC:
      return ltcAddressRegex.test(address);
    case CryptoType.DOGE:
      return dogeAddressRegex.test(address);
    case CryptoType.TON:
      return tonAddressRegex.test(address);
    case CryptoType.TRX:
      return trxAddressRegex.test(address);
    case CryptoType.XRP:
      return xrpAddressRegex.test(address);
    default:
      return false;
  }
};

export const createAddressSchema = z
  .object({
    address: addressFieldSchema,
    type: cryptoTypeSchema,
    label: labelSchema,
    direction: directionSchema.optional().default(AddressDirection.RECEIVING),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!isAddressValidForType(data.address, data.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: `Invalid ${data.type} address format`,
      });
    }
  });

export const updateAddressSchema = z
  .object({
    address: addressFieldSchema.optional(),
    label: labelSchema,
    direction: directionSchema.optional(),
    type: cryptoTypeSchema.optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.address !== undefined ||
      data.label !== undefined ||
      data.direction !== undefined ||
      data.type !== undefined,
    'At least one field is required',
  );
