import bcrypt from 'bcrypt';
import { CryptoType, Role, Status } from '@prisma/client';

import prisma from '../src/config/prisma';
import { logger } from '../src/utils/logger';
import { isAddressValidForType } from '../src/validators/address.validator';

const SALT_ROUNDS = 12;

interface SeedAddress {
  address: string;
  label?: string | null;
  type: CryptoType;
}

interface SeedUser {
  email: string;
  username: string;
  password: string;
  role: Role;
  status: Status;
  addresses?: SeedAddress[];
}

const seedUsers: SeedUser[] = [
  {
    email: 'admin@ezcrypto.com',
    username: 'admin',
    password: 'Admin123!',
    role: Role.ADMIN,
    status: Status.ACTIVE,
  },
  {
    email: 'user@ezcrypto.com',
    username: 'user',
    password: 'User123!',
    role: Role.USER,
    status: Status.ACTIVE,
    addresses: [
      {
        address: '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
        label: 'Main BTC Wallet',
        type: CryptoType.BTC,
      },
      {
        address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        label: 'Main ETH Wallet',
        type: CryptoType.ETH,
      },
      {
        address: 'So11111111111111111111111111111111111111112',
        label: 'Solana Trading Wallet',
        type: CryptoType.SOL,
      },
      {
        address: 'LZMFV5C4v2rW6zGyFNR7khRG3Gzdhvj1io',
        label: 'Long-Term LTC',
        type: CryptoType.LTC,
      },
      {
        address: 'DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L',
        label: 'DOGE Fun Wallet',
        type: CryptoType.DOGE,
      },
      {
        address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        label: null,
        type: CryptoType.BTC,
      },
    ],
  },
  {
    email: 'alice@ezcrypto.com',
    username: 'alice',
    password: 'Alice123!',
    role: Role.USER,
    status: Status.ACTIVE,
    addresses: [
      {
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        label: 'Primary ETH Vault',
        type: CryptoType.ETH,
      },
      {
        address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080',
        label: 'BTC Savings',
        type: CryptoType.BTC,
      },
      {
        address: 'Vote111111111111111111111111111111111111111',
        label: 'Solana Staking',
        type: CryptoType.SOL,
      },
      {
        address: 'DBXu2kgc3xtvCUWFcxFE3r9hEYgmuaaCyD',
        label: 'DOGE Side Wallet',
        type: CryptoType.DOGE,
      },
      {
        address: 'M9x9wY3yZ3P7N8L6bT1c4d5e6f7g8h9j2k',
        label: 'LTC Mobile',
        type: CryptoType.LTC,
      },
      {
        address: '0x66f820a414680B5bcda5eECA5dea238543F42054',
        label: null,
        type: CryptoType.ETH,
      },
    ],
  },
];

const validateSeedUsers = (users: SeedUser[]): void => {
  const seenEmails = new Set<string>();
  const seenUsernames = new Set<string>();

  for (const user of users) {
    if (seenEmails.has(user.email)) {
      throw new Error(`Duplicate seed email detected: ${user.email}`);
    }

    if (seenUsernames.has(user.username)) {
      throw new Error(`Duplicate seed username detected: ${user.username}`);
    }

    seenEmails.add(user.email);
    seenUsernames.add(user.username);

    if (!user.addresses?.length) {
      continue;
    }

    const seenAddresses = new Set<string>();

    for (const address of user.addresses) {
      const duplicateKey = `${address.type}:${address.address}`;

      if (seenAddresses.has(duplicateKey)) {
        throw new Error(
          `Duplicate seed address detected for ${user.email}: ${duplicateKey}`,
        );
      }

      if (!isAddressValidForType(address.address, address.type)) {
        throw new Error(
          `Invalid ${address.type} seed address detected for ${user.email}: ${address.address}`,
        );
      }

      seenAddresses.add(duplicateKey);
    }
  }
};

const upsertUser = async (seedUser: SeedUser) => {
  const hashedPassword = await bcrypt.hash(seedUser.password, SALT_ROUNDS);

  return prisma.user.upsert({
    where: {
      email: seedUser.email,
    },
    update: {
      username: seedUser.username,
      password: hashedPassword,
      role: seedUser.role,
      status: seedUser.status,
    },
    create: {
      email: seedUser.email,
      username: seedUser.username,
      password: hashedPassword,
      role: seedUser.role,
      status: seedUser.status,
    },
  });
};

const upsertAddresses = async (
  userId: string,
  addresses: SeedAddress[],
): Promise<void> => {
  for (const addressSeed of addresses) {
    await prisma.cryptoAddress.upsert({
      where: {
        userId_address_type: {
          userId,
          address: addressSeed.address,
          type: addressSeed.type,
        },
      },
      update: {
        label: addressSeed.label ?? null,
      },
      create: {
        userId,
        address: addressSeed.address,
        label: addressSeed.label ?? null,
        type: addressSeed.type,
      },
    });
  }
};

const main = async (): Promise<void> => {
  validateSeedUsers(seedUsers);

  const seededUsers = [];

  for (const seedUser of seedUsers) {
    const seededUser = await upsertUser(seedUser);
    seededUsers.push(seededUser);

    if (seedUser.addresses?.length) {
      await upsertAddresses(seededUser.id, seedUser.addresses);
    }
  }

  const normalUserCount = seededUsers.filter((user) => user.role === Role.USER).length;
  const seededAddressCount = seedUsers.reduce(
    (total, user) => total + (user.addresses?.length ?? 0),
    0,
  );

  logger.info(
    `Seed completed for ${seededUsers.length} users (${normalUserCount} normal users) and ${seededAddressCount} crypto addresses`,
  );
};

main()
  .catch((error: unknown) => {
    logger.error(`Seed failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
