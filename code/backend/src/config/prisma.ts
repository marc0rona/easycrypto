import { PrismaClient } from '@prisma/client';

import { env } from './env';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.databaseUrl,
      },
    },
  });

if (env.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
