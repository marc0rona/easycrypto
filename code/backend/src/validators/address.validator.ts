import { CryptoType } from '@prisma/client';
import { z } from 'zod';

const SUPPORTED_ADDRESS_TYPES = [
  CryptoType.BTC,
  CryptoType.ETH,
  CryptoType.SOL,
  CryptoType.LTC,
  CryptoType.DOGE,
] as const;
type SupportedAddressType = (typeof SUPPORTED_ADDRESS_TYPES)[number];

const btcAddressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;
const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
const solAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const ltcAddressRegex = /^(ltc1|[LM3])[a-km-zA-HJ-NP-Z1-9]{26,39}$/;
const dogeAddressRegex = /^(D|A|9)[a-km-zA-HJ-NP-Z1-9]{33}$/;

const supportedTypeMessage = `Type must be one of ${SUPPORTED_ADDRESS_TYPES.join(', ')}`;

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

export const isAddressValidForType = (
  address: string,
  type: SupportedAddressType,
): boolean => {
  switch (type) {
    case CryptoType.BTC:
      return btcAddressRegex.test(address);
    case CryptoType.ETH:
      return ethAddressRegex.test(address);
    case CryptoType.SOL:
      return solAddressRegex.test(address);
    case CryptoType.LTC:
      return ltcAddressRegex.test(address);
    case CryptoType.DOGE:
      return dogeAddressRegex.test(address);
    default:
      return false;
  }
};

export const createAddressSchema = z
  .object({
    address: addressFieldSchema,
    type: cryptoTypeSchema,
    label: labelSchema,
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
    label: labelSchema,
    type: cryptoTypeSchema.optional(),
  })
  .strict()
  .refine(
    (data) => data.label !== undefined || data.type !== undefined,
    'At least one field is required',
  );
