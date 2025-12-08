# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

E-commerce platform for φως (fos) - handmade jewellery - built with Next.js 15 and Payload CMS.

## Development Commands

```bash
# Development
yarn dev                    # Next.js dev server on port 3000

# Build
yarn build                  # Build the application

# Start production
yarn start                  # Start production server

# Linting
yarn lint                   # ESLint

# Type generation
yarn generate:types         # Generate TS types from Payload

# Email development
yarn email:dev              # React Email dev server (port 3002)

# Environment setup (Railway deployment)
yarn init                   # Login to Railway and load env vars
```

## Architecture

```
Next.js 15 (App Router)
    ↓
Payload CMS (embedded) ← Stripe (Payments)
    ↓
PostgreSQL ← S3 (Files) ← Resend (Emails)
```

### Source Structure (`src/`)

- **app/** - Next.js App Router pages and API routes
  - `(payload)/` - Payload admin interface
  - `api/` - API routes for store operations
- **collections/** - Payload CMS collections (Products, Categories, Orders, Carts, etc.)
- **globals/** - Payload global settings (SiteSettings)
- **components/** - shadcn/ui components with TailwindCSS
- **providers/** - CartProvider (global cart state via Context API), ThemeProvider
- **lib/** - Utility functions and Payload client
- **email/** - React Email templates

## Key Patterns

- **TypeScript everywhere** - Full type safety with Payload generated types
- **Form validation** - React Hook Form + Zod
- **Data fetching** - React Query/TanStack Query
- **Path aliases** - `@/*` maps to `src/*`
- **Image sources** - S3 bucket configured in `next.config.mjs` remotePatterns

## Configuration Files

- `payload.config.ts` - Payload CMS configuration (database, storage, email)
- `next.config.mjs` - Next.js config with Payload plugin
- `tailwind.config.ts` - Custom color system, dark mode support
- `components.json` - shadcn/ui component configuration
