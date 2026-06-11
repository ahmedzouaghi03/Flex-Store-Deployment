# ShoeStore

Shoe e-commerce storefront (display-only MVP). Monorepo structure matches the Spark project.

## Stack

- **pnpm + Turborepo**
- **Next.js 15** (`apps/web`)
- **PostgreSQL + Prisma** (`packages/db`)

## Setup

1. Copy `.env.example` to `.env` in the repo root (and/or `packages/db`).
2. Install dependencies:

```bash
pnpm install
```

3. Push schema and seed sample products:

```bash
pnpm db:push
pnpm db:seed
```

4. Start the dev server (port **3001**):

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

## Project structure

```text
ShoeStore/
├── apps/web/          # Next.js storefront
└── packages/db/       # Prisma schema & client
```

## Current scope

- Home, shop catalog, product detail pages
- No cart, checkout, or user accounts (coming later)
