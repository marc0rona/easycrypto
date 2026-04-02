# EZ-CRYPT0 Installing Guide

This project does not use one root `package.json`.
Install dependencies separately inside each app:

- `backend/`
- `frontend/`
- `extension/`

## Prerequisites

- Node.js and npm
- PostgreSQL running locally for the backend
- Google Chrome for the extension

## 1. Backend

From the project root:

```bash
cd backend
npm install
cp .env.example .env
```

Fill `backend/.env` with values like this:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ez_crypt0?schema=public
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=15m
```

Then run the database setup and start the API:

```bash
npx prisma migrate dev
npm run seed
npm run dev
```

Useful note:

- `npm run seed` creates demo accounts such as `admin@ezcrypto.com` and `user@ezcrypto.com`

## 2. Frontend

From the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs with Vite on `http://localhost:5173`.

Current project note:

- the frontend API layer is still using mock data, so it can start even if the backend is not running

## 3. Extension

From the project root:

```bash
cd extension
npm install
EZ_CRYPT0_API_BASE_URL=http://localhost:5000/api/v1 npm run build
```

If you want rebuilds while developing:

```bash
cd extension
EZ_CRYPT0_API_BASE_URL=http://localhost:5000/api/v1 npm run dev
```

Then load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `extension/dist` folder

## Quick Start Order

If someone wants to run the full project locally, use this order:

1. Install and start the backend
2. Install and start the frontend
3. Build the extension and load `extension/dist` in Chrome

## Folder Commands Summary

```bash
cd backend && npm install
cd frontend && npm install
cd extension && npm install
```
