# ShopEasy - Premium Reselling Store

A modern, premium e-commerce reselling website with a customer storefront and a hidden secure admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/storefront run dev` — run the storefront (port 18539)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — Cookie signing secret
- Optional env: `ADMIN_PASSWORD` — Admin panel password (default: admin123)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Zustand (cart state), wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contract
- `lib/db/src/schema/` — Drizzle ORM table definitions (products, categories, orders, banners, settings)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/storefront/src/pages/` — React pages (customer + admin)
- `artifacts/storefront/src/hooks/use-cart.tsx` — Zustand cart store with localStorage persistence

## Architecture decisions

- Admin auth uses signed cookies (cookie-parser) rather than JWT — simpler for single-admin use case
- Cart is client-side only (Zustand + localStorage) — no server-side cart needed for this reselling model
- Image uploads use URL input (not file upload) in admin — avoids the need for object storage on first build
- Orders are created immediately without auth — public checkout, admin-only order management
- Settings are stored as a single row in DB — simpler than key-value pairs for this use case

## Product

- **Customer storefront**: Homepage with banner carousel, category navigation, featured/recent products, product detail pages, shopping cart, checkout with COD/online payment, order confirmation
- **Admin panel** (at `/admin`): Password-protected dashboard with order stats, product CRUD, order management, banner management, store settings (WhatsApp number, announcement bar, hero text, social links)
- **Real-time**: Admin changes to settings/banners/products immediately reflect on the storefront

## User preferences

- Admin password: set via `ADMIN_PASSWORD` env var (default: `admin123`)
- WhatsApp number: configured in admin settings panel

## Gotchas

- Admin panel is at `/admin` — not linked from customer-facing pages
- After schema changes, run `pnpm --filter @workspace/db run push` then restart api-server
- After OpenAPI changes, run `pnpm --filter @workspace/api-spec run codegen` before editing frontend

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
