# KAR-GO-RENTALS

Premium dark-themed fleet management admin app for a self-drive car rental
business in Tamil Nadu, India. Handles the full rental lifecycle — setup,
fleet, bookings, handover/return, payments, expenses, service reminders,
damage incidents, customers, documents, and reports.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Prisma + SQLite
- Radix UI primitives

## Getting started

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). The first run walks
you through the setup wizard (business info, admins, fleet, pricing)
before landing on the dashboard.

## Project layout

- `src/app` — routes (App Router), grouped under `(app)` for the
  authenticated shell and `setup`/`login` for onboarding
- `src/components` — design system + feature components
- `src/lib` — Prisma client, auth, validation schemas, business logic
  (booking conflicts, finance aggregation, service reminders, notifications)
- `prisma/schema.prisma` — data model
- `scripts/` — one-off image processing scripts for vehicle/logo assets
