# MiniLedger Server

REST API for the MiniLedger mobile app.

## Requirements

- Node.js 20+
- npm
- A Neon PostgreSQL database

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set `DATABASE_URL` from Neon.
   Set `JWT_SECRET` to a random secret at least 32 characters long.

3. Generate Prisma Client and apply the schema:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Check `http://localhost:4000/api/health`.

## Scripts

- `npm run dev` — development server with reload
- `npm run typecheck` — TypeScript check
- `npm run build` — compile to `dist/`
- `npm test` — run tests

## API

- `POST /api/auth/request-otp` — `{ "phone": "+919876543210" }`
- `POST /api/auth/verify-otp` — `{ "phone": "+919876543210", "otp": "123456" }`
- `GET /api/loans` — authenticated
- `POST /api/loans` — authenticated; `{ "friendName": "Aman", "amount": 1200, "dueDate": "2026-10-25" }`
- `PATCH /api/loans/:id/repay` — authenticated
- `GET /api/summary` — authenticated
- `GET /api/health` — public health check

Send the JWT as `Authorization: Bearer <token>` for authenticated endpoints.

## Notes

- OTPs are printed to the server log only because this assignment asks for mock OTP login. Never log real OTPs in production.
- OTP request throttling in this assignment is in-memory and resets on restart; it is not a production rate limiter.
- Monetary values are persisted as PostgreSQL decimals and returned as decimal strings.
- This is a take-home assignment starter, not a production authentication service.
