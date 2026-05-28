# Frevest API

Base URL: `http://localhost:3000/api/v1`

All protected routes require: `Authorization: Bearer <token>`

All responses are wrapped: `{ "success": true, "data": ... }`

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account `{ name, email, password, phone? }` |
| POST | `/auth/login` | No | Sign in `{ email, password }` → `{ accessToken, user }` |
| POST | `/auth/kyc/phone` | Yes | Submit phone `{ phone }` |
| POST | `/auth/kyc/otp` | Yes | Verify OTP `{ otp }` (any 6-digit code accepted in test mode) |
| POST | `/auth/kyc/email` | Yes | Trigger email verification |
| POST | `/auth/kyc/selfie` | Yes | Complete selfie / finish KYC |

**Seeded test user:** `amaka.obi@frevest.co` / `password123`

---

## Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update `{ name?, phone? }` |
| PATCH | `/users/me/preferences` | Update `{ biometricEnabled?, pushNotifications?, emailDigests? }` |

---

## Products (Marketplace)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products. Query: `?search=&cat=&sort=apy|risk|min&currency=NGN|USD` |
| GET | `/products/highlighted` | Highest-APY product |
| GET | `/products/:id` | Single product detail |

**Categories:** `mutual`, `treasury`, `fixed`, `dollar`, `realestate`, `stocks`, `bonds`

---

## Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolio/summary` | Total value, invested, earned, series data for chart |
| GET | `/portfolio/holdings` | Holdings with product info + gain/% |
| GET | `/portfolio/allocation` | Donut data, currency split, risk profile |
| GET | `/portfolio/growth` | Monthly bar data, top performers |

---

## Wallet

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet/balance` | NGN + USD balances |
| GET | `/wallet/linked-accounts` | Linked banks/cards |
| POST | `/wallet/linked-accounts` | Add `{ type, name, last4, meta }` |
| DELETE | `/wallet/linked-accounts/:id` | Remove linked account |
| POST | `/wallet/fund` | Add money `{ amount, method: bank|card|ussd, currency: NGN|USD }` |
| POST | `/wallet/withdraw` | Withdraw `{ amount, linkedAccountId, currency }` |
| POST | `/wallet/invest` | Buy product `{ productId, amount, currency }` |
| POST | `/wallet/redeem/:holdingId` | Sell / redeem a holding |

---

## Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions` | List. Query: `?type=deposit|buy|sell|earn|withdraw&limit=20&offset=0` |

---

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List with unread count |
| PATCH | `/notifications/read-all` | Mark all read |
| PATCH | `/notifications/:id/read` | Mark one read |

---

## Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/goals` | List goals with `pct` progress |
| GET | `/goals/:id` | Single goal |
| POST | `/goals` | Create `{ name, target, current, currency, cat }` |
| PATCH | `/goals/:id` | Update `{ current }` |
| DELETE | `/goals/:id` | Delete goal |
