## xPay Frontend

A modern Next.js 15 app that delivers xPay’s landing experience, marketplace, and creator dashboard. It integrates Coinbase CDP Wallet for signature-based login, talks to the backend API, and provides a smooth workflow to register, manage, and share paid endpoints. It also showcases MCP discovery, proxy URL builders, and reviews.

### Highlights
- **Polished landing** explaining xPay and x402 microtransactions (Solana/USDC)
- **Marketplace** to browse and discover paid endpoints with ratings
- **Creator dashboard** to create/update/delete endpoints and track earnings
- **Wallet-based auth** using Coinbase CDP: sign a message once to receive a JWT
- **Proxy/MCP URL builders** you can copy and share
- **Great DX**: React Query, Tailwind + Radix UI, toast/sonner feedback, app router

---

## Tech stack
- Framework: Next.js 15 (App Router)
- Styling/UI: Tailwind CSS, Radix UI, custom components, Lucide icons
- State/Data: React Query
- Auth/Wallet: Coinbase Embedded Wallets (CDP React SDK)
- Notifications: `sonner`
- Typescript throughout

---

## Environment variables
Create `.env.local` in `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CDP_PROJECT_ID=your-cdp-project-id
```
- `NEXT_PUBLIC_API_URL`: Base URL of the xPay backend.
- `NEXT_PUBLIC_CDP_PROJECT_ID`: From Coinbase CDP portal. Required for wallet connect + signature login.

If `NEXT_PUBLIC_CDP_PROJECT_ID` is missing, the app will warn and some auth flows will be disabled.

---

## Getting started
```bash
cd frontend
npm install
npm run dev
# -> http://localhost:3001
```

Ensure the backend is running at `NEXT_PUBLIC_API_URL` (default: `http://localhost:3000`).

---

## Key flows

### Wallet sign-in → JWT
Component: `src/components/auth/SignatureModal.tsx`
- Prompts a Coinbase CDP wallet signature with a human-readable message
- Sends `{ walletAddress, message, signature }` to `POST /auth/login`
- Stores `{ token, user }` in localStorage (`src/lib/auth.ts`)
- Subsequent API calls send `Authorization: Bearer <token>`

### Endpoint management
APIs: `src/lib/api.ts`
- `endpointsApi.createEndpoint/updateEndpoint/deleteEndpoint`
- Fields include: name, description, original URL, HTTP method, payment amount, token type (SPL mint), optional custom auth headers, and sample request/response to improve docs and MCP tool schemas

### Marketplace and reviews
- List all endpoints with ratings (`GET /endpoints`)
- View details, examples, and average rating
- Authenticated users can submit a review (`POST /reviews`)

### Proxy & MCP URL helpers
- `getProxyUrl(username, endpointName)` → e.g., `http://localhost:3000/:username/:endpointName`
- `getMcpUrl(username)` → e.g., `http://localhost:3000/mcp/:username`

---

## Project structure (selected)
- `app/` app router pages (landing, dashboard, profile, marketplace, MCP)
- `src/components/` shared UI and page components
  - `auth/` login/logout/signature
  - `dashboard/` endpoint CRUD, summaries, tables
  - `landing/` hero, features, how-it-works, marketplace tease
- `src/lib/` API and auth utilities
- `public/` assets (logo, icons, fonts)

---

## Scripts
```bash
npm run dev     # Start dev server (port 3001)
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # ESLint (fix)
npm run format  # Prettier
```