# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

E-commerce platform for φως (fos) - handmade jewellery - built as a monorepo with three independent workspaces:
- **frontend/** - Next.js 14 storefront
- **medusa/** - Medusa v2 headless commerce backend
- **strapi/** - Strapi v5 CMS

## Development Commands

```bash
# Start all services (from root)
yarn dev                    # All services in parallel
yarn dev:frontend          # Next.js on port 3000
yarn dev:medusa            # Medusa on port 9000
yarn dev:strapi            # Strapi on port 1337

# Build
yarn build                 # Build all workspaces
yarn build:frontend
yarn build:medusa
yarn build:strapi

# Type generation
yarn generate-types        # Generate TS types from Strapi

# Environment setup (Railway deployment)
yarn env-init             # Login to Railway and load env vars
```

### Service-specific commands

**Medusa:**
```bash
yarn test:unit                    # Unit tests
yarn test:integration:http        # HTTP integration tests
yarn test:integration:modules     # Module integration tests
yarn email:dev                    # React Email dev server (port 3002)
```

**Frontend:**
```bash
yarn lint                  # ESLint
yarn fetch-types           # Generate types from Strapi API
```

## Architecture

```
Next.js Frontend (SSR/CSR)
    ↓
Medusa Commerce API ← Stripe (Payments)
    ↓
Strapi CMS
    ↓
PostgreSQL ← Redis (Cache/Events) ← MinIO (Files) ← Resend (Emails)
```

### Frontend (`frontend/src/`)
- **App Router** with React Server Components
- `providers/` - CartProvider (global cart state via Context API), ThemeProvider
- `lib/` - SDK clients for Medusa, Strapi, Stripe
- `components/` - shadcn/ui components with TailwindCSS
- Cart stored in localStorage, synced with Medusa backend

### Medusa Backend (`medusa/src/`)
- Event-driven architecture with Redis event bus
- `modules/minio-file/` - Custom MinIO file storage provider
- `modules/email-notifications/` - Resend email provider with React Email templates
- `workflows/` - Business process workflows (order fulfillment)
- `subscribers/` - Event handlers for order-placed, order-shipped, store-invite
- `api/` - Custom REST endpoints

### Strapi CMS (`strapi/src/`)
- Content served via REST API with dynamic population
- TypeScript types auto-generated from schema
- Bearer token authentication

## Key Patterns

- **TypeScript everywhere** - Full type safety with generated types from Strapi
- **Form validation** - React Hook Form + Zod
- **Data fetching** - React Query/TanStack Query
- **Path aliases** - `@/*` maps to `src/*` in frontend
- **Image sources** - MinIO bucket configured in `next.config.mjs` remotePatterns

## Configuration Files

- `medusa/medusa-config.ts` - Database, Redis, file storage, payment, email providers
- `frontend/next.config.mjs` - Image remotePatterns, Highlight.io error tracking
- `frontend/tailwind.config.ts` - Custom color system, dark mode support
- `frontend/components.json` - shadcn/ui component configuration
