# OnnoMart API

Backend for **OnnoMart**, a multi-vendor e-commerce platform. One API serves three
roles — shoppers, vendors and the platform admin — with JWT auth, Prisma over
PostgreSQL, Cloudinary uploads and SSLCommerz / Aamarpay checkout.

- **Live API**: https://onnomart-api-ali-x.vercel.app
- **Frontend repo**: https://github.com/md-ali-0/onno-mart-client
- **Database**: Neon PostgreSQL (Singapore region)

---

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js + Express, TypeScript |
| Database | PostgreSQL via Prisma 6 (16 migrations) |
| Auth | JWT access + refresh tokens, bcrypt hashing |
| Uploads | Cloudinary with multer |
| Payments | SSLCommerz, Aamarpay |
| Mail | Nodemailer over Gmail SMTP |
| Hosting | Vercel serverless functions (region iad1) |

## Modules

Each module under `src/app/modules/*` is a controller / service / route / validation
quartet:

`Auth` · `User` · `Product` · `Category` · `Brand` · `Shop` · `Order` · `Payment` ·
`Review` · `Coupon` · `Newsletter` · `Dashboard`

Routes are mounted under `/api`, so `GET /api/product?page=1&limit=12` and
`GET /api/statistics` are real endpoints. List endpoints return
`{ success, message, meta, data }` with pagination metadata.

---

## Local setup

```bash
git clone https://github.com/md-ali-0/onno-mart-server.git
cd onno-mart-server
pnpm install                 # runs prisma generate via postinstall

cp .env.example .env         # then fill in the values
pnpm exec prisma migrate dev # apply migrations
pnpm run seed                # optional: demo catalogue
pnpm run dev                 # http://localhost:5000
```

`pnpm run seed` wipes and reloads the demo data: 24 products, 6 categories,
10 brands, 3 shops, 3 orders, 5 reviews and 3 coupons. Every seeded account uses
the password `OnnoMart@123`.

| Role | Email |
| --- | --- |
| Admin | `admin@onnomart.dev` |
| Vendor (Dhaka Gadget House) | `gadget@onnomart.dev` |
| Vendor (Rongdhonu Fashion) | `fashion@onnomart.dev` |
| Vendor (Shobuj Bazar) | `living@onnomart.dev` |
| Customer | `customer@onnomart.dev` |

Also available: `pnpm run build` (prisma generate + tsc), `pnpm run typecheck`,
`pnpm run migrate` (production migrations).

## Environment

`.env.example` lists every variable the code reads. The ones that matter:

- `DATABASE_URL` — on Vercel use the **pooled** Neon connection string; use the
  direct one for migrations, because migrations hold advisory locks.
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `RESET_PASS_TOKEN` — separate values.
- `CLIENT_URL` — the browser origin allowed by CORS.
- `EMAIL` + `APP_PASS` — Gmail address and app password for password-reset mail.
- `CLOUDINARY_*` — needed for product and shop image uploads.
- `STORE_ID`, `STORE_PASS`, `AMARPAY_*` — payment gateway credentials
  (sandbox URLs are already in `.env.example`).

## Deploying to Vercel

The API runs as a single serverless function:

- `api/index.ts` exports the Express app. `src/server.ts` is only for local dev —
  it calls `app.listen`, which a serverless platform never invokes.
- `vercel.json` rewrites every path to `/api`.
- `prisma/schema.prisma` generates the client for both the local and the
  `rhel-openssl-3.0.x` (Vercel) runtime.
- `postinstall` runs `prisma generate`, so the client always matches the schema.
- `pnpm-workspace.yaml` allows the `prisma`, `bcrypt` and `esbuild` build scripts,
  otherwise pnpm skips them and the deploy fails at runtime.

Set the environment variables in the Vercel project, then either push to `main`
or deploy manually. Cold-start SQL goes through the pooled connection string.

## Known gaps

- Payment callbacks need real SSLCommerz / Aamarpay credentials plus public
  `SUCCESS_URL` / `CANCEL_URL` / `FAIL_URL` values; the sandbox URLs are wired up,
  the store credentials are not.
- Password reset mail needs a Gmail app password; without it the endpoint fails.
- Uploads need Cloudinary credentials; the seeded catalogue uses plain image URLs
  so browsing and checkout work without them.

---

Built by [Mohammad Ali](https://github.com/md-ali-0).
