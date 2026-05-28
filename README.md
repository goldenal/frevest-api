# Frevest API

A NestJS REST API that powers the Frevest fintech platform — a Nigerian investment and savings app supporting mutual funds, treasury bills, fixed savings, dollar funds, real estate trusts, stocks/ETFs, and bonds.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Modules](#modules)
- [Authentication & Security](#authentication--security)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Overview

Frevest API is a demo/prototype backend built with NestJS. All data lives in an **in-memory store** (no database) that is seeded with realistic data on startup. It is designed to power a mobile investment app for the Nigerian market, supporting both NGN and USD-denominated products.

**Base URL:** `http://localhost:3000/api/v1`

**Test credentials:** `amaka.obi@frevest.co` / `password123`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     HTTP Client                          │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   NestJS Application                     │
│                                                          │
│  Global Prefix: /api/v1                                  │
│  Global Pipe:   ValidationPipe (whitelist + transform)   │
│  Global Interceptor: ResponseInterceptor                 │
│    └── wraps all responses: { success: true, data: ... } │
│  CORS: enabled for all origins                           │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Auth   │  │  Users   │  │ Products │              │
│  │ Module   │  │  Module  │  │  Module  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Portfolio │  │  Wallet  │  │Transactions              │
│  │  Module  │  │  Module  │  │  Module  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐                             │
│  │Notifcatn │  │  Goals   │                             │
│  │  Module  │  │  Module  │                             │
│  └──────────┘  └──────────┘                             │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              StoreModule (Singleton)              │   │
│  │           InMemoryStore — shared state            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| In-memory store over a database | Prototype/demo speed — no migration overhead, seeded data on boot |
| Single global `ResponseInterceptor` | Uniform `{ success, data }` envelope across all endpoints |
| `StoreModule` as a global singleton | All feature modules share one store instance injected via DI |
| JWT with 7-day expiry | Balances mobile UX (infrequent re-login) against session risk |
| `ValidationPipe` with `whitelist: true` | Strips undeclared properties at the boundary; DTOs are the contract |

### Request Lifecycle

```
Request
  → CORS middleware
  → JWT Guard (protected routes)
  → ValidationPipe (DTO validation + transformation)
  → Controller
  → Service  ──→  InMemoryStore
  → ResponseInterceptor
  → { success: true, data: <result> }
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | NestJS v11 |
| Language | TypeScript 5.7 |
| Auth | Passport.js + `passport-jwt` + `@nestjs/jwt` |
| Password hashing | bcryptjs |
| Validation | `class-validator` + `class-transformer` |
| Testing | Jest + Supertest |

---

## Project Structure

```
src/
├── main.ts                          # Bootstrap, global config
├── app.module.ts                    # Root module, registers all feature modules
│
├── store/
│   ├── in-memory.store.ts           # Single source of truth — all data + CRUD helpers
│   └── store.module.ts              # Exports InMemoryStore as a global provider
│
├── common/
│   └── interceptors/
│       └── response.interceptor.ts  # Wraps every response in { success, data }
│
├── auth/
│   ├── auth.controller.ts           # /auth/register, /auth/login, /auth/kyc/*
│   ├── auth.service.ts              # Registration, login, KYC step simulation
│   ├── auth.module.ts               # Registers JwtModule + PassportModule
│   ├── strategies/jwt.strategy.ts   # Extracts userId from Bearer token
│   ├── guards/jwt-auth.guard.ts     # Protects routes
│   └── dto/                         # RegisterDto, LoginDto, KycDto
│
├── users/
│   ├── users.controller.ts          # GET/PATCH /users/me, PATCH /users/me/preferences
│   └── users.module.ts
│
├── products/
│   ├── products.controller.ts       # GET /products, /products/highlighted, /products/:id
│   ├── products.service.ts          # Filtering, sorting, search
│   ├── products.module.ts
│   └── dto/query.dto.ts             # Search/filter/sort query params
│
├── portfolio/
│   ├── portfolio.controller.ts      # GET /portfolio/summary|holdings|allocation|growth
│   ├── portfolio.service.ts         # Aggregation logic, chart series, gain calculations
│   └── portfolio.module.ts
│
├── wallet/
│   ├── wallet.controller.ts         # Balance, linked accounts, fund/withdraw/invest/redeem
│   ├── wallet.service.ts            # Wallet mutation logic, transaction recording
│   ├── wallet.module.ts
│   └── dto/fund.dto.ts
│
├── transactions/
│   ├── transactions.controller.ts   # GET /transactions (with type filter + pagination)
│   ├── transactions.service.ts
│   └── transactions.module.ts
│
├── notifications/
│   ├── notifications.controller.ts  # GET, PATCH read-all, PATCH :id/read
│   ├── notifications.service.ts
│   └── notifications.module.ts
│
└── goals/
    ├── goals.controller.ts          # CRUD /goals
    ├── goals.service.ts
    ├── goals.module.ts
    └── dto/goal.dto.ts
```

---

## Data Models

All models are defined in `src/store/in-memory.store.ts` and stored in typed arrays.

### User
```ts
{
  id: string
  name: string
  email: string
  passwordHash: string
  phone: string
  tier: 1 | 2
  kycStatus: 'none' | 'pending' | 'verified'
  walletNgn: number
  walletUsd: number
  biometricEnabled: boolean
  pushNotifications: boolean
  emailDigests: boolean
  createdAt: string
}
```

### Product
```ts
{
  id: string
  name: string
  issuer: string
  cat: 'mutual' | 'treasury' | 'fixed' | 'dollar' | 'realestate' | 'stocks' | 'bonds'
  label: string
  apy: number
  risk: 1 | 2 | 3       // 1=low, 2=medium, 3=high
  minimum: number
  lock: string           // e.g. "90 days", "No lock"
  currency: 'NGN' | 'USD'
  blurb: string
  tags: string[]
}
```

### Holding
```ts
{
  id: string
  userId: string
  productId: string
  invested: number
  current: number        // current value (reflects unrealised gain)
  units: number
  since: string
  currency: 'NGN' | 'USD'
}
```

### Transaction
```ts
{
  id: string
  userId: string
  date: string
  type: 'deposit' | 'buy' | 'sell' | 'earn' | 'withdraw'
  title: string
  meta: string
  amount: number         // negative for outflows
  usd?: number           // USD equivalent for cross-currency ops
}
```

### Notification
```ts
{
  id: string
  userId: string
  when: string           // human-readable relative time
  cat: 'earn' | 'market' | 'secure' | 'goal' | 'system'
  title: string
  body: string
  unread: boolean
  createdAt: string
}
```

### Goal
```ts
{
  id: string
  userId: string
  name: string
  target: number
  current: number
  currency: 'NGN' | 'USD'
  cat: string
}
```

### LinkedAccount
```ts
{
  id: string
  userId: string
  type: 'bank' | 'card'
  name: string
  last4: string
  isDefault: boolean
  meta?: string
}
```

---

## Modules

### StoreModule
Global singleton. `InMemoryStore` is exported and injected into every feature service. Contains all seeded data and typed CRUD helpers. **Data does not persist across server restarts.**

### AuthModule
Handles registration, login, and a simulated 4-step KYC flow (phone → OTP → email → selfie). Issues JWT tokens signed with `JWT_SECRET` (defaults to `frevest-secret-key`). Password hashed with bcrypt (10 rounds).

### UsersModule
Exposes the authenticated user's profile and preferences. Reads/writes through `InMemoryStore`.

### ProductsModule
Read-only marketplace. Supports full-text search, category filter, currency filter, and sorting by APY, risk, or minimum investment.

### PortfolioModule
Aggregates holdings into summary stats, chart series data, allocation breakdowns, and growth metrics. All computation is done in-service from raw holdings data.

### WalletModule
Handles wallet funding, withdrawals, investment purchases, and holding redemptions. All operations mutate `walletNgn`/`walletUsd` on the user and append a transaction record.

### TransactionsModule
Returns a user's transaction history, sorted newest-first, with optional type filtering and limit/offset pagination.

### NotificationsModule
Returns per-user notifications sorted by `createdAt`. Supports marking individual or all notifications as read.

### GoalsModule
Full CRUD for savings goals. The `pct` progress field is computed on read as `(current / target) * 100`.

---

## Authentication & Security

- **Strategy:** JWT Bearer tokens via `passport-jwt`
- **Token expiry:** 7 days
- **Payload:** `{ sub: userId, email }`
- **Protected routes:** decorated with `@UseGuards(JwtAuthGuard)`
- **Password storage:** bcrypt hash, 10 salt rounds
- **KYC simulation:** OTP accepts any 6-digit string in test mode

All responses strip `passwordHash` before returning user objects.

---

## API Reference

See [API.md](./API.md) for the full endpoint reference.

**Quick summary:**

| Module | Base path |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Products | `/api/v1/products` |
| Portfolio | `/api/v1/portfolio` |
| Wallet | `/api/v1/wallet` |
| Transactions | `/api/v1/transactions` |
| Notifications | `/api/v1/notifications` |
| Goals | `/api/v1/goals` |

---

## Getting Started

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The server starts on port `3000` by default. Override with the `PORT` environment variable.

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port the server listens on |
| `JWT_SECRET` | `frevest-secret-key` | Secret used to sign JWT tokens — **change in production** |

Copy `.env.example` and fill in values:

```bash
cp .env.example .env
```
