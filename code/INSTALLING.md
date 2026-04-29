# EZ-CRYPT0 Installation Guide

This project does not use one root `package.json`.
You need to install and run each part separately:

- `backend/` -> REST API + PostgreSQL
- `server/` -> local market API for coin prices
- `frontend/` -> web app
- `extension/` -> optional Chrome extension

If you want the web app to work properly, run at least:

1. PostgreSQL
2. `backend/`
3. `server/`
4. `frontend/`

## Prerequisites

Install these first:

- Node.js LTS
- npm
- PostgreSQL
- Google Chrome if you want to use the extension

## Ports Used In This Guide

This guide uses these local ports:

- Backend API: `5050`
- Market API: `3000`
- Frontend: `5173`

`5050` is used for the backend so it matches the frontend proxy configuration already in the repo.

## 1. Open The Project Root

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code
```

## 2. Install Dependencies

Run these commands one time:

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/backend
npm install
```

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/server
npm install
```

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/frontend
npm install
```

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/extension
npm install
```

## 3. Create The Backend Environment File

Copy the example file:

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/backend
cp .env.example .env
```

Open `backend/.env` and set it like this:

```env
PORT=5050
NODE_ENV=development
DATABASE_URL=postgresql://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@127.0.0.1:5432/ez_crypt0?schema=public
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-this-with-another-long-random-secret
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173
```

Notes:

- Replace `YOUR_POSTGRES_USER` and `YOUR_POSTGRES_PASSWORD` with your PostgreSQL credentials.
- If your PostgreSQL user does not use a password locally, remove `:YOUR_POSTGRES_PASSWORD`.
- Keep `PORT=5050` unless you also change the frontend proxy config.

Example without a password:

```env
DATABASE_URL=postgresql://postgres@127.0.0.1:5432/ez_crypt0?schema=public
```

## 4. Create The PostgreSQL Database

Create the database before running Prisma migrations.

Example command:

```bash
createdb -h 127.0.0.1 -U YOUR_POSTGRES_USER ez_crypt0
```

If the database already exists, you can skip this step.

## 5. Run The Backend

Open a new terminal and run:

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/backend
npm run migrate:deploy
npm run seed
npm run dev
```

When it starts, the API should be available at:

```txt
http://localhost:5050/api/v1
```

Seeded accounts you can use right away:

- Admin: `admin@ezcrypto.com` / `Admin123!`
- User: `user@ezcrypto.com` / `User123!`

## 6. Run The Local Market API

Open another terminal and run:

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/server
npm start
```

When it starts, the market API should be available at:

```txt
http://localhost:3000/market
```

This service is used by the frontend and extension for price data.

## 7. Run The Frontend

Open another terminal and run:

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/frontend
npm run dev
```

Then open:

```txt
http://localhost:5173
```

At this point, the web application should be running.

## 8. Build And Load The Chrome Extension (Optional)

Open another terminal and run:

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/extension
npm run build
```

Then load it in Chrome:

1. Open `chrome://extensions`
2. Turn on Developer mode
3. Click `Load unpacked`
4. Select this folder:

```txt
/Users/driss/Desktop/ezz/easycrypto-driss_docs/code/extension/dist
```

If you want rebuilds while developing the extension:

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/extension
npm run dev
```

## 9. Quick Startup Order After First Install

After you already installed everything once, use this order:

1. Start PostgreSQL
2. Start the backend
3. Start the market API
4. Start the frontend
5. Build or watch the extension if you need it

## 10. Quick Copy-Paste Commands

### Terminal 1 - Backend

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/backend
npm run dev
```

### Terminal 2 - Market API

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/server
npm start
```

### Terminal 3 - Frontend

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/frontend
npm run dev
```

### Terminal 4 - Extension Optional

```bash
cd /Users/driss/Desktop/ezz/easycrypto-driss_docs/code/extension
npm run build
```

## 11. Quick Checks

If something is not working, check these URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5050/api/v1`
- Market API: `http://localhost:3000/market`

You can also test the market API directly:

```bash
curl http://localhost:3000/market
```

## 12. Common Problems

### PostgreSQL connection error

Your `DATABASE_URL` is wrong or PostgreSQL is not running.

### Frontend cannot log in

Make sure the backend is running on `5050`.

### Prices are missing in the dashboard or swap page

Make sure `server/` is running on `3000`.

### Extension cannot talk to the backend

Build the extension again after you change `backend/.env`, then reload the unpacked extension in Chrome.
