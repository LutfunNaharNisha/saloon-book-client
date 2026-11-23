# SalonBook — Salon Appointment Booking Platform

SalonBook is a role-based salon appointment booking platform. Customers can explore services, request appointments and pay for confirmed bookings through Stripe. Administrators can manage services, review requests, manage customers and monitor payments.

This repository contains the **Next.js client**. The REST API, authentication, JWT verification, database and Stripe webhook live in the separate server repository.

## Important Features

- Responsive salon-themed interface with dark/light theme toggle
- Public home page with featured services, category explorer and booking guide
- Browse services with name search, category filtering and price sorting
- Protected service details with appointment request form and predefined time slots
- Better Auth email/password and Google sign-in, with role-aware redirects
- Customer dashboard: overview, appointments, cancellation, Stripe checkout and profile
- Admin dashboard: overview, services CRUD, image upload, appointments, users and transactions
- Role-based route guards for customer/admin areas; blocked users cannot access protected pages
- Toast notifications, loading states and proper error/empty states
- ShadCN UI components built on Radix primitives and Tailwind CSS

## Technology Stack

- Next.js 15 (App Router) and React 19
- TypeScript
- Tailwind CSS and ShadCN UI
- Better Auth (client SDK)
- Sonner (toasts), next-themes, lucide-react
- REST API client for the Express backend
- ImgBB image uploads

## Installation Instructions

```bash
git clone <client-repository-link>
cd saloon-book-client
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the values for your own environment. Never commit real secrets.

## How to Run the Project Locally

1. Start the Express server from the server repository (default `http://localhost:5000`).
2. Start this client:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

Other useful commands:

```bash
npm run typecheck
npm run build
npm start
```

## Required Environment Variables

Names only — no secret values are included here.

**Client**

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_IMGBB_API_KEY`
- `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (also the JWT issuer/audience)
- `MONGO_URI`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Server (configure in the server repository)**

- `MONGO_URI`
- `AUTH_URL` (must match the client's `BETTER_AUTH_URL`)
- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Better Auth signs users in and issues JWTs in the frontend only; the Express API no longer hosts an auth handler or uses cookie sessions. Every protected endpoint requires `Authorization: Bearer <token>`: the API verifies the signature against the frontend's `/api/auth/jwks`, checks issuer/audience, re-reads the user's role and blocked state from MongoDB, then applies role checks. Frontend guards improve UX but are not a substitute for server authorization.

## Live Website Link

`<live-website-link>`

## Client and Server Repository Links

- Client: `<client-repository-link>`
- Server: `<server-repository-link>`

## Notes

- Admin accounts are created securely on the server, never through public registration.
- Payment status is changed only by the verified Stripe webhook on the server; this client never marks transactions as paid.
- Public pages do not require authentication. Service details and dashboards require a valid session.
