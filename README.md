## xPay - Turn any endpoint into a paid microservice

Monetize your endpoints without writing code. xPay is the first no-code platform to help you monetize your endpoint and infrastructure. xPay wraps your existing HTTP endpoints with a trust-minimized pay-per-request proxy powered by x402 microtransactions on Solana (USDC by default). In minutes, your API can accept payments, expose a beautiful marketplace listing with reviews, and even become an MCP server that AI agents can call as first-class tools.

### Why this matters
- **Own your distribution**: No keys to rotate or centralized gatekeepers. Each request proves payment cryptographically.
- **Instant settlement**: Payments land directly in your wallet with near-zero fees and no custody risk.
- **AI-native**: Your endpoints instantly become MCP tools, usable by LLM agents with built-in, per-call payments.
- **No-code onboarding**: Point to your existing API, set a price, pick a token, and share your new paid URL.

---

## What you can do with xPay
- **Wrap any HTTP endpoint** in a paid proxy: `https://api.yourxpay.com/:username/:endpointName`
- **Set per-call pricing and token** (USDC SPL by default; any SPL token address supported)
- **Enforce payment** via the x402 standard with Faremeter middleware
- **List your API in a marketplace** with ratings, usage examples, and earnings
- **Provide AI agents an MCP server** at `GET/POST /mcp/:username` where each tool = your endpoint

---

## How it works (high level)
1. **Register an endpoint** (creator dashboard or API): name, description, original URL, HTTP method, price, token, optional auth headers, sample I/O.
2. **xPay generates a paid proxy URL**: e.g. `/:username/:endpointName` which forwards to your original URL.
3. **Faremeter x402 middleware** verifies payment on each call, then forwards the request and returns the response.
4. **Earnings tracked** per endpoint on successful 2xx responses.
5. **AI/MCP**: xPay builds a per-user MCP server; each endpoint becomes a tool with typed inputs from your sample body.
6. **Users and reviews**: Consumers can rate endpoints; creators manage profile, endpoints, and monitor balances.

---

## Architecture overview
- **Backend**: Node.js + Express (TypeScript), Drizzle ORM (Postgres), Zod validation, JWT auth, Solana Web3, Faremeter x402 middleware, MCP SDK, Axios proxy, Vercel AI SDK endpoints for text/image examples.
- **Frontend**: Next.js 15 (App Router), Tailwind + Radix UI, React Query, Coinbase CDP Wallet for signature-based login, polished landing and dashboard UX.
- **Storage/Infra**: Postgres (DATABASE_URL), optional local uploads for AI image examples, environment-driven configuration.

See module guides:
- Backend README: [`backend/README.md`](backend/README.md)
- Frontend README: [`frontend/README.md`](frontend/README.md)

---

## Quickstart

1. Fill in all required environment variables in the appropriate `.env` files. Refer to the provided `.env.example` files in each app for guidance.
2. From the repo root, install all dependencies:
   ```
   npm install
   ```
3. Start all apps in development mode:
   ```
   npm run dev
   ```
4. (Optional) For backend DB migrations, you can still use:
   ```
   npm run db:generate && npm run db:migrate
   ```
5. The backend will default to `http://localhost:3000`, and the frontend to `http://localhost:3001`.

---

## Key capabilities in depth

### x402-powered paywall
Every paid proxy call passes through Faremeter’s x402 middleware:
- Accepts Solana SPL tokens (USDC mint by default)
- Enforces exact per-call pricing
- Attaches resource metadata and description for auditability
- Streams responses after payment verification

### Marketplace and reviews
`GET /endpoints` returns a paginated catalog including average ratings and counts. Creators grow reputation; consumers discover reliable tools.

### Dynamic MCP servers
Each user gets an MCP server at `/mcp/:username`. Tools are synthesized from your registered endpoints:
- Tool descriptions include method and cost
- Input schemas are generated from your sample request body
- Session lifecycle handled via `mcp-session-id`
- Payment is bypassed for MCP protocol list/initialize calls but enforced for tool invocations

### Creator auth (wallet signature → JWT)
Frontend uses Coinbase CDP wallet to sign a message. Backend verifies the signature and issues a JWT for authenticated actions (create/update/delete endpoints, update profile).

---

## Production notes
- Run Postgres with backups and TLS.
- Keep `JWT_SECRET` secure and rotate on schedule.
- Use a dedicated Solana RPC; set `SOLANA_RPC_URL`.
- Review CORS and rate limits for public routes.
- Prefer mainnet-beta for real payments; use small price increments to test.

---

## License
MIT. See [LICENSE.md](./LICENSE.md)

---

Questions or ideas? Open an issue or PR. We’d love to see what APIs you monetize with xPay.
