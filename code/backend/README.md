Last updated: 2026-03-26
Version: 1.2

# EZ-CRYPT0 Backend Agent Context

Mirror rule: `backend/AGENTS.md` and `backend/README.md` must stay byte-for-byte identical.
Canonical intent: this file is for Codex/agents, not end users.
Scope: backend only. Root [AGENTS.md](/Users/driss/Desktop/Computer%20science/Implimentation/easycrypto/code/AGENTS.md) still applies first.

## 1. Agent Usage Rules
```txt
- Read root AGENTS.md first, then this file
- Treat this file as backend memory + backend-specific rules
- If this file and code disagree, trust code and update this file
- Keep layered architecture: routes -> controllers -> services -> Prisma/PostgreSQL
- Keep all API routes under /api/v1
- Keep business logic in services only
- Keep validation in middleware before controllers when a validator exists
- Use AppError + global error handler for failures
- Use authenticate for protected routes
- Use requireRole(Role.ADMIN) for admin-only routes
- Every address read/update/delete must be scoped to req.user.id
- Never trust userId from request body
- Never return password
- Never store private keys
- Never use process.env outside src/config/env.ts
- Never use direct console logging outside src/utils/logger.ts
- Do not recreate removed scaffold/test routes
```

## 2. Project Overview
- EZ-CRYPT0 backend is a TypeScript + Express REST API for user authentication, crypto address management, admin user management, and Chrome extension address import.
- Backend stack is fixed around Prisma + PostgreSQL with JWT auth and service-layer business logic.
- Out of scope: private keys, blockchain transactions, balances/history, mobile clients, non-Chrome extension support.

## 3. Key Decisions Already Made
```txt
- Access token lifetime is 15 minutes
- Auth uses Bearer JWT in Authorization header
- No refresh-token flow yet
- No logout endpoint yet
- CORS allows only http://localhost:5173 and chrome-extension://<32-char-id>
- Chrome extension uses the same authenticated API as the web app
- Admin can manage users only; admin must not modify crypto addresses
- User address isolation is enforced server-side by req.user.id ownership checks
- Temp scaffold routes and DB test routes were removed during cleanup
```

## 4. Tech Stack
```txt
Runtime:
- Node.js
- TypeScript 6.0.2
- Express 5.2.1

Database / ORM:
- PostgreSQL
- Prisma 6.19.2
- @prisma/client 6.19.2

Auth / Security:
- bcrypt 6.0.0
- jsonwebtoken 9.0.3
- helmet 8.1.0
- express-rate-limit 8.3.1
- cors 2.8.6
- dotenv 17.3.1

Validation:
- zod 4.3.6

Dev / Tooling:
- ts-node 10.9.2
- ts-node-dev 2.0.0
- nodemon 3.1.14
- Prisma Migrate
- Prisma seed

Type packages:
- @types/bcrypt 6.0.0
- @types/cors 2.8.19
- @types/express 5.0.6
- @types/jsonwebtoken 9.0.10
- @types/node 25.5.0
```

## 5. Folder Structure
```txt
backend/
├── .env                         # local runtime env
├── .env.example                 # env template
├── AGENTS.md                    # canonical backend agent context
├── README.md                    # exact mirror of AGENTS.md
├── package.json                 # scripts + dependencies
├── package-lock.json            # npm lockfile
├── tsconfig.json                # TS config; ES2020/commonjs/strict
├── prisma/
│   ├── schema.prisma            # Prisma datasource, enums, models
│   ├── seed.ts                  # idempotent seed script
│   └── migrations/
│       ├── 20260326134440_init/
│       │   └── migration.sql    # initial schema migration
│       └── migration_lock.toml  # Prisma migration metadata
└── src/
    ├── app.ts                   # Express app + middleware stack
    ├── server.ts                # app.listen bootstrap
    ├── config/
    │   ├── env.ts               # typed env loader + validation
    │   └── prisma.ts            # Prisma singleton
    ├── constants/
    │   └── roles.ts             # role constants
    ├── controllers/
    │   ├── auth.controller.ts   # register/login handlers
    │   ├── address.controller.ts# address CRUD + extension import handlers
    │   └── admin.controller.ts  # admin user-management handlers
    ├── middleware/
    │   ├── auth.middleware.ts   # JWT auth
    │   ├── role.middleware.ts   # role gate
    │   ├── validate.middleware.ts # Zod body validation
    │   └── error.middleware.ts  # 404 + global error handler
    ├── routes/
    │   ├── index.ts             # mounts auth/addresses/admin
    │   ├── auth.routes.ts       # auth routes
    │   ├── address.routes.ts    # address routes
    │   └── admin.routes.ts      # admin routes
    ├── services/
    │   ├── auth.service.ts      # auth business logic
    │   ├── address.service.ts   # address business logic
    │   └── admin.service.ts     # admin business logic
    ├── types/
    │   └── index.ts             # shared types + Express req.user augmentation
    ├── utils/
    │   ├── AppError.ts          # custom error with statusCode/errors[]
    │   └── logger.ts            # [INFO]/[ERROR] logger wrapper
    └── validators/
        ├── auth.validator.ts    # register/login schemas
        └── address.validator.ts # address schemas + BTC/ETH validators
```

## 6. Environment Variables
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=15m
```

```txt
Uses:
- PORT: Express listen port
- NODE_ENV: development | test | production
- DATABASE_URL: Prisma PostgreSQL connection string
- JWT_SECRET: JWT sign/verify secret
- JWT_EXPIRES_IN: access token lifetime
```

## 7. Database Connection
```txt
ORM: PrismaClient singleton
DB: PostgreSQL
Datasource: env("DATABASE_URL")
Config file: src/config/prisma.ts
Development behavior: caches Prisma client on globalThis
```

```txt
Local dev DB used during implementation:
- host: 127.0.0.1
- port: 5432
- database: ez_crypt0
- schema: public
```

## 8. Models & Schema
```txt
Enum Role:
- USER
- ADMIN

Enum Status:
- ACTIVE
- DISABLED
- BANNED

Enum CryptoType:
- BTC
- ETH
- SOL
- LTC
- DOGE
```

```txt
User
- id: String @id @default(uuid())
- email: String @unique
- username: String @unique
- password: String
- role: Role @default(USER)
- status: Status @default(ACTIVE)
- createdAt: DateTime @default(now())
- updatedAt: DateTime @default(now()) @updatedAt
- cryptoAddresses: CryptoAddress[]
```

```txt
CryptoAddress
- id: String @id @default(uuid())
- address: String
- label: String?
- type: CryptoType
- userId: String
- createdAt: DateTime @default(now())
- updatedAt: DateTime @default(now()) @updatedAt
- user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
Constraints:
- required owner relation
- @@index([userId])
- @@index([address])
- @@unique([userId, address, type])
```

```txt
AdminLog
- id: String @id @default(uuid())
- adminId: String
- action: String
- createdAt: DateTime @default(now())
Constraints:
- @@index([adminId])
Status:
- table exists
- no service writes/reads yet
```

```txt
Relationships:
- User 1 -> many CryptoAddress
- CryptoAddress -> exactly 1 User
- deleting User cascades CryptoAddress deletes
```

## 9. Seed Data
```txt
Seed file: prisma/seed.ts

Creates/updates:
- admin@ezcrypto.com / username: admin / password: Admin123! / role: ADMIN / status: ACTIVE
- user@ezcrypto.com / username: user / password: User123! / role: USER / status: ACTIVE

Addresses seeded for normal user:
- BTC: 1BoatSLRHtKNngkdXEeobR76b53LETtpyT
- ETH: 0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe

Behavior:
- idempotent user upsert
- address duplicate check before insert
```

## 10. Middleware Stack
```txt
app.ts order:
1. request logger
2. helmet()
3. globalRateLimiter: 100 req / 15 min / IP
4. authRateLimiter:
   - /api/v1/auth/login
   - /api/v1/auth/register
   max 5 req / 1 min / IP
5. strict CORS
6. express.json()
7. /api/v1 router
8. notFoundHandler
9. errorHandler
```

```txt
CORS policy:
- allow http://localhost:5173
- allow chrome-extension://[a-p]{32}
- deny everything else with 403 AppError
```

```txt
auth.middleware.ts
- reads Authorization: Bearer <token>
- verifies JWT with env.jwtSecret
- requires payload: { userId: string, role: 'USER' | 'ADMIN' }
- sets req.user = { id, role }
- returns 401 Unauthorized on failure
```

```txt
role.middleware.ts
- factory: requireRole(requiredRole)
- 401 if req.user missing
- 403 if role mismatch
```

```txt
validate.middleware.ts
- factory: validateBody(schema)
- validates req.body with Zod
- replaces req.body with parsed result
- throws AppError(400, 'Validation error', errors[])
```

```txt
error.middleware.ts
- notFoundHandler -> AppError(404, 'Route not found')
- errorHandler:
  - known AppError/statusCode -> status + message
  - unknown error -> 500 Internal Server Error
  - includes errors[] when present
  - includes stack only when NODE_ENV=development
```

## 11. Auth System
```txt
Strategy:
- JWT access token only
- login returns token in JSON body
- protected routes expect Authorization: Bearer <token>
- no refresh-token flow yet
- no logout endpoint yet
- no httpOnly cookie auth flow yet
```

```json
JWT payload:
{
  "userId": "uuid",
  "role": "USER" | "ADMIN"
}
```

```txt
Rules:
- bcrypt salt rounds = 12
- password never returned
- login blocked for DISABLED and BANNED users
- admin routes must use authenticate + requireRole(Role.ADMIN)
- protected routes derive identity from req.user only
```

## 12. API Inventory

### Global response shapes
```json
// success
{ "success": true, "data": "..." }

// error
{ "success": false, "message": "..." }

// validation error
{ "success": false, "message": "Validation error", "errors": ["..."] }
```

### Auth Routes
```txt
POST /api/v1/auth/register
Auth: none
Validation: registerSchema
Body:
{
  "email": "user@example.com",
  "username": "user123",
  "password": "strongpassword"
}
Success 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user123",
    "role": "USER"
  }
}
Errors:
- 400 invalid input / duplicate email / duplicate username
```

```txt
POST /api/v1/auth/login
Auth: none
Validation: loginSchema
Body:
{
  "email": "user@example.com",
  "password": "strongpassword"
}
Success 200:
{
  "success": true,
  "data": {
    "token": "jwt",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "user123",
      "role": "USER"
    }
  }
}
Errors:
- 400 invalid input
- 401 invalid credentials
- 403 disabled or banned user
```

### Address Routes
```txt
GET /api/v1/addresses
Auth: authenticate
Validation: none
Success 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "address": "0x...",
      "label": "My wallet",
      "type": "ETH",
      "createdAt": "ISO"
    }
  ]
}
Rules:
- always filtered by req.user.id
- no pagination yet
```

```txt
POST /api/v1/addresses
Auth: authenticate
Validation: createAddressSchema
Body:
{
  "address": "0x...",
  "type": "ETH",
  "label": "My wallet"
}
Success 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "address": "0x...",
    "label": "My wallet",
    "type": "ETH",
    "createdAt": "ISO"
  }
}
Errors:
- 400 validation/service errors
- 401 unauthorized
Notes:
- userId always comes from req.user.id
- duplicate prevention is not implemented on this route yet
```

```txt
POST /api/v1/addresses/from-extension
Auth: authenticate
Validation: createAddressSchema
Body:
{
  "address": "0x...",
  "type": "ETH",
  "label": "optional"
}
Success 201 on create / 200 on duplicate:
{
  "success": true,
  "data": {
    "id": "uuid",
    "address": "0x...",
    "type": "ETH"
  }
}
Rules:
- same address + same user returns existing row
- default label = Imported from extension
- userId always comes from req.user.id
```

```txt
PATCH /api/v1/addresses/:id
Auth: authenticate
Validation: updateAddressSchema
Body:
{
  "label": "Updated label",
  "type": "BTC"
}
Success 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "address": "0x... or btc...",
    "label": "Updated label",
    "type": "BTC",
    "createdAt": "ISO"
  }
}
Errors:
- 400 invalid body / invalid type transition / missing id
- 401 unauthorized
- 403 not owner
- 404 address not found
```

```txt
DELETE /api/v1/addresses/:id
Auth: authenticate
Validation: none
Success 200:
{
  "success": true,
  "data": {
    "message": "Address deleted successfully"
  }
}
Errors:
- 400 missing id
- 401 unauthorized
- 403 not owner
- 404 address not found
```

### Admin Routes
```txt
GET /api/v1/admin/users
Auth: authenticate + requireRole(Role.ADMIN)
Validation: none
Success 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "username": "user123",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "ISO"
    }
  ]
}
Errors:
- 401 unauthorized
- 403 non-admin
Rule:
- password is never selected
```

```txt
PATCH /api/v1/admin/users/:id/status
Auth: authenticate + requireRole(Role.ADMIN)
Validation: service-level only
Body:
{
  "status": "ACTIVE | DISABLED | BANNED"
}
Success 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user123",
    "role": "USER",
    "status": "DISABLED",
    "createdAt": "ISO"
  }
}
Errors:
- 400 missing id / invalid status / self-update attempt
- 401 unauthorized
- 403 non-admin
- 404 user not found
Rules:
- admin cannot change own status
```

```txt
DELETE /api/v1/admin/users/:id
Auth: authenticate + requireRole(Role.ADMIN)
Validation: none
Success 200:
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
Errors:
- 400 missing id / self-delete attempt
- 401 unauthorized
- 403 non-admin
- 404 user not found
Rules:
- admin cannot delete own account
```

## 13. Validators
```txt
auth.validator.ts
- registerSchema:
  - email: valid email
  - username: min 3
  - password: trimmed length >= 6
- loginSchema:
  - email: valid email
  - password: required after trim
```

```txt
address.validator.ts
- supported types: BTC, ETH
- BTC regex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/
- ETH regex: /^0x[a-fA-F0-9]{40}$/
- createAddressSchema:
  - address required
  - type required, normalized to uppercase
  - label optional
  - address/type cross-check enforced
- updateAddressSchema:
  - label optional
  - type optional, normalized to uppercase
  - at least one field required
```

## 14. Key Services / Functions
```txt
AuthService.registerUser(input)
- normalizes email to lowercase
- trims username
- duplicate checks email + username
- hashes password
- creates USER + ACTIVE
- returns safe user object
```

```txt
AuthService.loginUser(input)
- normalizes email to lowercase
- checks bcrypt.compare
- blocks DISABLED/BANNED
- signs JWT with { userId, role }
- returns { token, user }
```

```txt
AddressService.getAddresses(userId)
- returns only addresses owned by userId
```

```txt
AddressService.createAddress(userId, input)
- creates address owned by authenticated user
- returns selected address fields
- does not dedupe normal address creation
```

```txt
AddressService.createAddressFromExtension(userId, input)
- duplicate check by { userId, address }
- default label = Imported from extension
- returns existing row if already imported
```

```txt
AddressService.updateAddress(addressId, userId, input)
- verifies ownership
- partial update for label/type
- rejects type changes that no longer match stored address format
```

```txt
AddressService.deleteAddress(addressId, userId)
- verifies ownership
- hard deletes row
- returns { message }
```

```txt
AdminService.getUsers()
- lists all users without password
- orders by createdAt desc
```

```txt
AdminService.updateUserStatus(adminId, userId, input)
- validates status against Prisma Status enum
- blocks self-status changes
- updates target user status
```

```txt
AdminService.deleteUser(adminId, userId)
- blocks self-delete
- hard deletes target user
- CryptoAddress cascade delete handled by Prisma schema
```

## 15. Current Status
```txt
Fully built:
- typed env/config loader
- Prisma/PostgreSQL connection
- initial migration applied
- seed script
- register/login
- JWT auth middleware
- role middleware
- address CRUD
- extension import endpoint
- Zod validation
- centralized error handling
- Helmet + rate limiting + strict CORS
- admin user list/status/delete
- cleanup pass completed
- temp/test routes removed
```

```txt
Manually verified previously:
- register
- login
- create address
- get addresses
- update address
- delete address
- admin get users
- admin update status
- admin delete user
- user blocked from admin routes
- no circular dependencies found in src/
```

## 16. Known Gaps / Limitations
```txt
- refresh-token + httpOnly cookie flow not implemented yet
- logout endpoint not implemented
- /api/v1/users/me PATCH not implemented
- /api/v1/users/me DELETE not implemented
- /api/v1/admin/system GET not implemented
- AdminLog model exists but is unused
- automated tests (Jest/Supertest) not implemented yet
- GET /api/v1/addresses has no pagination/sorting/filtering yet
- POST /api/v1/addresses allows duplicates for same user; only /from-extension dedupes
- admin status update uses service validation, not Zod middleware
- CORS allows any syntactically valid Chrome extension origin, not a pinned extension ID
- logger is a custom console wrapper, not Winston/Pino
- development mode includes stack traces in error responses
- current auth flow does not yet satisfy the root-project refresh-token requirement
```

## 17. Next Steps
```txt
1. Implement refresh-token + logout flow with httpOnly cookie
2. Add /api/v1/users/me update/delete routes
3. Add pagination + sorting to GET /api/v1/addresses
4. Add Zod validation middleware for admin status updates
5. Write AdminLog entries for admin status/delete actions
6. Add duplicate prevention to normal POST /api/v1/addresses
7. Pin Chrome extension origin through env/config instead of broad regex
8. Add Jest + Supertest coverage for auth, addresses, admin, and middleware
9. Revisit logger if strict Winston/Pino compliance is required
```
