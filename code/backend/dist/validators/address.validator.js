"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = exports.isAddressValidForType = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const SUPPORTED_ADDRESS_TYPES = [
    client_1.CryptoType.BTC,
    client_1.CryptoType.ETH,
    client_1.CryptoType.SOL,
    client_1.CryptoType.LTC,
    client_1.CryptoType.DOGE,
    client_1.CryptoType.XRP,
    client_1.CryptoType.ADA,
    client_1.CryptoType.TON,
    client_1.CryptoType.DOT,
    client_1.CryptoType.TRX,
    client_1.CryptoType.ATOM,
];
const adaAddressRegex = /^(?:addr1[0-9a-z]{20,}|Ae2[1-9A-HJ-NP-Za-km-z]{20,}|DdzFF[1-9A-HJ-NP-Za-km-z]{20,})$/;
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
const supportedDirectionMessage = `Direction must be one of ${Object.values(client_1.AddressDirection).join(', ')}`;
const cryptoTypeSchema = zod_1.z
    .string()
    .transform((value) => value.trim().toUpperCase())
    .refine((value) => SUPPORTED_ADDRESS_TYPES.includes(value), supportedTypeMessage);
const addressFieldSchema = zod_1.z.string().trim().min(1, 'Address is required');
const labelSchema = zod_1.z.string().trim().optional();
const directionSchema = zod_1.z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => Object.values(client_1.AddressDirection).includes(value), supportedDirectionMessage);
const isAddressValidForType = (address, type) => {
    switch (type) {
        case client_1.CryptoType.BTC:
            return btcAddressRegex.test(address);
        case client_1.CryptoType.ETH:
            return ethAddressRegex.test(address);
        case client_1.CryptoType.ADA:
            return adaAddressRegex.test(address);
        case client_1.CryptoType.ATOM:
            return atomAddressRegex.test(address);
        case client_1.CryptoType.DOT:
            return dotAddressRegex.test(address);
        case client_1.CryptoType.SOL:
            return solAddressRegex.test(address);
        case client_1.CryptoType.LTC:
            return ltcAddressRegex.test(address);
        case client_1.CryptoType.DOGE:
            return dogeAddressRegex.test(address);
        case client_1.CryptoType.TON:
            return tonAddressRegex.test(address);
        case client_1.CryptoType.TRX:
            return trxAddressRegex.test(address);
        case client_1.CryptoType.XRP:
            return xrpAddressRegex.test(address);
        default:
            return false;
    }
};
exports.isAddressValidForType = isAddressValidForType;
exports.createAddressSchema = zod_1.z
    .object({
    address: addressFieldSchema,
    type: cryptoTypeSchema,
    label: labelSchema,
    direction: directionSchema.optional().default(client_1.AddressDirection.RECEIVING),
})
    .strict()
    .superRefine((data, ctx) => {
    if (!(0, exports.isAddressValidForType)(data.address, data.type)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['address'],
            message: `Invalid ${data.type} address format`,
        });
    }
});
exports.updateAddressSchema = zod_1.z
    .object({
    address: addressFieldSchema.optional(),
    label: labelSchema,
    direction: directionSchema.optional(),
    type: cryptoTypeSchema.optional(),
})
    .strict()
    .refine((data) => data.address !== undefined ||
    data.label !== undefined ||
    data.direction !== undefined ||
    data.type !== undefined, 'At least one field is required');
