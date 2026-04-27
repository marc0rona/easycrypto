# EZ-CRYPT0 Data Guide

## Overview

EZ-CRYPT0 uses PostgreSQL as its primary relational database and Prisma as the ORM layer for the Express backend.

The current database is responsible for storing:

- User accounts
- User-owned crypto addresses
- Admin activity logs

The current Prisma schema does not include a dedicated session or refresh-token table. Authentication tokens are generated in the backend service layer, while the database persists the user records those tokens represent.

## Database Schema

### Prisma Schema Location

```txt
backend/prisma/schema.prisma
```

### Datasource and Generator

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Enums

#### `Role`

Used by the `User` model.

```txt
USER
ADMIN
```

#### `Status`

Used by the `User` model.

```txt
ACTIVE
DISABLED
BANNED
```

#### `CryptoType`

Used by the `CryptoAddress` model.

```txt
BTC
ETH
SOL
LTC
DOGE
XRP
ADA
TON
DOT
TRX
ATOM
```

#### `AddressDirection`

Used by the `CryptoAddress` model.

```txt
RECEIVING
SENDING
```

### Model: `User`

- Prisma model: `User`
- PostgreSQL table: `"User"`
- Primary key: `id`

| Field | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | `String` | `@id`, `@default(uuid())` |
| `email` | `String` | `@unique`, required |
| `name` | `String` | required |
| `username` | `String` | `@unique`, required |
| `password` | `String` | required, stores bcrypt hash |
| `role` | `Role` | `@default(USER)` |
| `status` | `Status` | `@default(ACTIVE)` |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@default(now())`, `@updatedAt` |
| `cryptoAddresses` | `CryptoAddress[]` | one-to-many relation to `CryptoAddress` |

Relationships:

- One `User` can own many `CryptoAddress` rows.

Indexes and constraints:

- Unique index on `email`
- Unique index on `username`

### Model: `CryptoAddress`

- Prisma model: `CryptoAddress`
- PostgreSQL table: `"CryptoAddress"`
- Primary key: `id`

| Field | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | `String` | `@id`, `@default(uuid())` |
| `address` | `String` | required |
| `label` | `String?` | nullable |
| `type` | `CryptoType` | required |
| `direction` | `AddressDirection` | `@default(RECEIVING)` |
| `userId` | `String` | foreign key to `User.id` |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@default(now())`, `@updatedAt` |
| `user` | `User` | required relation to owner |

Relationships:

- Many `CryptoAddress` rows belong to one `User`.
- Foreign key: `userId -> User.id`
- Delete behavior: `onDelete: Cascade`

Indexes and constraints:

- `@@index([userId])`
- `@@index([address])`
- `@@unique([userId, address, type])`

That composite unique constraint means a user cannot store the same address twice for the same crypto type.

### Model: `AdminLog`

- Prisma model: `AdminLog`
- PostgreSQL table: `"AdminLog"`
- Primary key: `id`

| Field | Type | Constraints / Notes |
| --- | --- | --- |
| `id` | `String` | `@id`, `@default(uuid())` |
| `adminId` | `String` | required, indexed |
| `action` | `String` | required |
| `createdAt` | `DateTime` | `@default(now())` |

Relationships:

- No Prisma relation is currently declared for `adminId`.
- `adminId` is stored as a plain string, not a foreign-key relation in the current schema.

Indexes and constraints:

- `@@index([adminId])`

### Relationship Summary

```txt
User (1) ----< CryptoAddress (many)
AdminLog is standalone in the current schema
```

## Integration

### Where Prisma Client Is Initialized

Prisma is initialized in:

```txt
backend/src/config/prisma.ts
```

Current implementation:

```ts
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
```

In development, the Prisma client is cached on `globalThis` to avoid creating multiple connections during hot reloads.

### How PostgreSQL Connects to the Express Backend

The flow is:

1. `backend/src/config/env.ts` loads and validates `DATABASE_URL`.
2. `backend/src/config/prisma.ts` creates the Prisma client using that URL.
3. Service-layer files import Prisma and perform database operations.
4. Controllers call services, and routes call controllers through Express.

Key service files using Prisma:

```txt
backend/src/services/auth.service.ts
backend/src/services/address.service.ts
backend/src/services/admin.service.ts
backend/prisma/seed.ts
```

Express bootstrap files:

```txt
backend/src/app.ts
backend/src/server.ts
```

This matches the project’s layered architecture:

```txt
routes -> controllers -> services -> Prisma/PostgreSQL
```

### Environment Variable Used

Prisma reads the PostgreSQL connection string from:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ez_crypt0?schema=public
```

### Prisma Schema File Location

```txt
backend/prisma/schema.prisma
```

## Setup Commands

Run database-related commands from the `backend/` directory.

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Example:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ez_crypt0?schema=public
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-this-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
```

### 3. Initialize Prisma

If you are bootstrapping Prisma from scratch in a brand-new backend app:

```bash
npx prisma init
```

For this repository, Prisma is already initialized, so you normally do not need to run that command after cloning.

### 4. Run Migrations

For local development:

```bash
npx prisma migrate dev
```

For applying committed migrations in a deployment-style flow:

```bash
npm run migrate:deploy
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

Prisma also regenerates the client automatically during some migration workflows, but running it directly is useful after schema changes.

### 6. Seed the Database

The backend includes an idempotent Prisma seed file:

```txt
backend/prisma/seed.ts
```

Run it with:

```bash
npm run seed
```

What it seeds:

- Demo admin user
- Demo standard users
- Sample crypto addresses across supported `CryptoType` values

### 7. Reset the Database

```bash
npx prisma migrate reset
```

This drops the database schema, reapplies migrations, and can trigger seeding again if confirmed.

### 8. Check Migration Status

```bash
npm run migrate:status
```

## Useful Queries

Because Prisma created capitalized table names like `"User"` and `"CryptoAddress"`, raw SQL queries should use quoted identifiers in PostgreSQL.

### List All Users

#### `psql` / SQL

```sql
SELECT
  "id",
  "email",
  "name",
  "username",
  "role",
  "status",
  "createdAt",
  "updatedAt"
FROM "User"
ORDER BY "createdAt" DESC;
```

#### Prisma

```ts
const users = await prisma.user.findMany({
  orderBy: {
    createdAt: 'desc',
  },
  select: {
    id: true,
    email: true,
    name: true,
    username: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  },
});
```

### Find All Addresses by User ID

#### `psql` / SQL

```sql
SELECT
  "id",
  "address",
  "label",
  "type",
  "direction",
  "userId",
  "createdAt",
  "updatedAt"
FROM "CryptoAddress"
WHERE "userId" = 'idriss'
ORDER BY "createdAt" DESC;
```

#### Prisma

```ts
const addresses = await prisma.cryptoAddress.findMany({
  where: {
    userId: 'USER_UUID_HERE',
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Filter Addresses by `cryptoType` or `status`

`status` belongs to the `User` table, while crypto type belongs to `CryptoAddress`, so filtering by both requires a join or nested relation filter.

#### `psql` / SQL

Filter by crypto type only:

```sql
SELECT
  "id",
  "address",
  "label",
  "type",
  "direction",
  "userId"
FROM "CryptoAddress"
WHERE "type" = 'BTC'
ORDER BY "createdAt" DESC;
```

Filter addresses whose owners are active:

```sql
SELECT
  ca."id",
  ca."address",
  ca."label",
  ca."type",
  ca."direction",
  ca."userId"
FROM "CryptoAddress" ca
JOIN "User" u ON u."id" = ca."userId"
WHERE u."status" = 'ACTIVE'
ORDER BY ca."createdAt" DESC;
```

Filter by both owner status and crypto type:

```sql
SELECT
  ca."id",
  ca."address",
  ca."label",
  ca."type",
  ca."direction",
  ca."userId"
FROM "CryptoAddress" ca
JOIN "User" u ON u."id" = ca."userId"
WHERE ca."type" = 'ETH'
  AND u."status" = 'ACTIVE'
ORDER BY ca."createdAt" DESC;
```

#### Prisma

Filter by crypto type only:

```ts
const btcAddresses = await prisma.cryptoAddress.findMany({
  where: {
    type: 'BTC',
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

Filter addresses whose owners are active:

```ts
const activeUserAddresses = await prisma.cryptoAddress.findMany({
  where: {
    user: {
      status: 'ACTIVE',
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

Filter by both owner status and crypto type:

```ts
const activeEthAddresses = await prisma.cryptoAddress.findMany({
  where: {
    type: 'ETH',
    user: {
      status: 'ACTIVE',
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

### Count Total Addresses Per User

#### `psql` / SQL

```sql
SELECT
  u."id",
  u."email",
  u."username",
  COUNT(ca."id") AS "addressCount"
FROM "User" u
LEFT JOIN "CryptoAddress" ca ON ca."userId" = u."id"
GROUP BY u."id", u."email", u."username"
ORDER BY "addressCount" DESC, u."createdAt" DESC;
```

#### Prisma

```ts
const usersWithAddressCounts = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    username: true,
    _count: {
      select: {
        cryptoAddresses: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

If you want a simplified shape:

```ts
const summary = usersWithAddressCounts.map((user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  addressCount: user._count.cryptoAddresses,
}));
```

## Testing the Database

### 1. Connect to PostgreSQL with `psql`

If your local database is running on the standard port:

```bash
psql postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ez_crypt0
```

If you are already inside `psql`, you can verify the current database with:

```sql
\conninfo
```

### 2. Inspect Tables and Enums Manually

Inside `psql`:

```sql
\dt
```

To inspect the `User` table:

```sql
\d "User"
```

To inspect the `CryptoAddress` table:

```sql
\d "CryptoAddress"
```

To inspect enum types:

```sql
\dT+ "Role"
\dT+ "Status"
\dT+ "CryptoType"
\dT+ "AddressDirection"
```

### 3. Run Manual Test Queries

Example checks:

```sql
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "CryptoAddress";
SELECT COUNT(*) FROM "AdminLog";
```

Inspect a few rows:

```sql
SELECT * FROM "User" LIMIT 5;
SELECT * FROM "CryptoAddress" LIMIT 5;
SELECT * FROM "AdminLog" LIMIT 5;
```

Verify ownership relationships:

```sql
SELECT
  u."email",
  ca."address",
  ca."type",
  ca."direction"
FROM "User" u
JOIN "CryptoAddress" ca ON ca."userId" = u."id"
ORDER BY u."email", ca."createdAt";
```

### 4. Use Prisma Studio

Prisma Studio gives you a visual UI for browsing and editing records during development.

From `backend/`:

```bash
npx prisma studio
```

Then open the local URL shown in the terminal.

### 5. Verify Migrations Applied Correctly

Check Prisma’s migration status:

```bash
npm run migrate:status
```

You can also inspect the migration history table directly:

```sql
SELECT
  "migration_name",
  "started_at",
  "finished_at",
  "rolled_back_at"
FROM "_prisma_migrations"
ORDER BY "started_at" DESC;
```

Expected migration folders currently present in the repo:

```txt
20260326134440_init
20260327120000_add_user_updated_at
20260327133000_harden_crypto_address
20260406173000_add_xrp_crypto_type
20260406190500_add_auto_detectable_coin_types
20260409141500_add_address_direction
20260414110000_add_user_name_and_profile_actions
```

## Environment Variables

### Required for Prisma / Database Access

#### `DATABASE_URL`

Main PostgreSQL connection string used by Prisma:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ez_crypt0?schema=public
```

Notes:

- Used in `backend/prisma/schema.prisma`
- Validated in `backend/src/config/env.ts`
- Passed into Prisma client initialization in `backend/src/config/prisma.ts`

### Related Backend Environment Variables

These are not Prisma-specific, but they are commonly present in the same backend `.env` file:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-this-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
```

### Prisma-Specific Configuration Notes

The current project does not define extra Prisma env vars such as:

- `DIRECT_URL`
- `SHADOW_DATABASE_URL`

At the moment, Prisma uses only:

```env
DATABASE_URL
```

## Seed Data Notes

The seed script is:

```txt
backend/prisma/seed.ts
```

Important implementation details:

- Uses `bcrypt` with `12` salt rounds
- Upserts users by email
- Upserts addresses by the composite unique key `(userId, address, type)`
- Validates seed addresses before inserting them
- Disconnects Prisma cleanly with `await prisma.$disconnect()`

## Practical File Map

```txt
backend/
├── .env.example
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
└── src/
    ├── app.ts
    ├── server.ts
    ├── config/
    │   ├── env.ts
    │   └── prisma.ts
    └── services/
        ├── auth.service.ts
        ├── address.service.ts
        └── admin.service.ts
```

## Summary

EZ-CRYPT0 currently uses a compact PostgreSQL schema centered around users and their crypto addresses, with Prisma providing typed access from the Express service layer. If you need to inspect or extend the data layer, start with `backend/prisma/schema.prisma`, `backend/src/config/prisma.ts`, and the service files that import Prisma.
