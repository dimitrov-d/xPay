## xPay Backend

TypeScript/Express service that powers xPay’s paid proxy, marketplace, and AI-native MCP server. It enforces x402 payments on Solana (via Faremeter), manages endpoint metadata and earnings, exposes a discovery marketplace, provides signature-based authentication and JWT sessions, and dynamically spins up an MCP server per creator.

### Highlights
- **Paid proxy**: Forwards requests to creators’ original APIs only after verifying x402 payment
- **MCP servers**: Synthesizes an MCP server for each creator; every endpoint becomes a tool
- **Marketplace APIs**: List endpoints with ratings, fetch details, and paginate results
- **Creator auth**: Solana wallet signature → JWT; update profile and manage endpoints
- **Reviews**: 1–5 star ratings per endpoint; aggregates average rating and totals
- **AI utilities**: Example text and image generation endpoints to showcase storage/serving

---

## Tech stack
- Runtime: Node.js, TypeScript
- Web: Express 5
- Data: Postgres + Drizzle ORM (`drizzle-orm/postgres-js`)
- Validation: Zod
- Auth: Solana signature verification (tweetnacl, bs58) + JWT
- Payments: Faremeter x402 middleware, Solana SPL (USDC by default)
- AI: Vercel AI SDK (`ai`, `@ai-sdk/openai`) examples
- MCP: `@modelcontextprotocol/sdk` with streamable HTTP transport
- HTTP: Axios proxy

---

## Environment variables
- `DATABASE_URL` (required): Postgres connection string
- `JWT_SECRET` (required): Secret used to sign JWTs
- `JWT_EXPIRES_IN` (optional): e.g., `7d` (default)
- `PORT` (optional): Defaults to `3000`
- `SOLANA_RPC_URL` (optional): Overrides default `clusterApiUrl('mainnet-beta')`

---

## Local development
```bash
cd backend
npm install

# Run migrations
npm run db:generate
npm run db:migrate

# Start dev server
npm run dev
# -> http://localhost:3000
```

Health check: `GET /health`

---

## Core middleware and services

### Paywall (HTTP proxy)
File: `src/middleware/paywall.ts`
- Looks up endpoint by `:username`, `:endpointName`, and HTTP method
- Builds Faremeter x402 middleware:
  - `network: "mainnet-beta"`
  - `asset: tokenType` (SPL mint address; USDC by default)
  - `amount: paymentAmount * 10^6` (USDC decimals)
  - `payTo: userWallet`
- Passes resource metadata and description to the facilitator

Applied in proxy route:
```
/:username/:endpointName   // all methods
```

### MCP paywall
File: `src/middleware/mcp-paywall.ts`
- Bypasses payment for MCP protocol discovery/list methods
- Enforces payment for `tools/call` by mapping tool name -> endpoint configuration

### Proxy service
File: `src/services/proxy.ts`
- Forwards the original request with merged headers and optional custom auth headers
- Preserves query params; removes hop-by-hop headers

### MCP server
File: `src/services/mcp.ts`
- Creates a per-user MCP server using endpoints as tools
- Generates input schema from stored `sampleBody` and `httpMethod`
- Maintains sessions via `mcp-session-id` header

---

## API reference (summary)

Base URL: `http://localhost:3000`

### Auth
- `POST /auth/login`
  - Body: `{ walletAddress, message, signature }`
  - Validates Solana signature, issues `{ token, user }`
- `GET /auth/verify` (Bearer JWT)
  - Returns `{ valid, user? }`

### Users
- `GET /user/profile` (Bearer JWT)
  - Returns user + balances (SOL, USDC)
- `PUT /user/profile` (Bearer JWT)
  - Body: `{ username }` (unique)

### Endpoints (marketplace + CRUD)
- `GET /endpoints?page&limit`
  - Paginated marketplace listing including `averageRating`, `totalReviews`
- `GET /endpoints/:id`
  - Endpoint details
- `GET /endpoints/user/:wallet`
  - Creator’s endpoints by wallet
- `POST /endpoints` (Bearer JWT)
  - Body: `{ username, name, description, originalUrl, httpMethod, paymentAmount, tokenType, customAuthHeaders?, sampleBody?, sampleResponse? }`
- `PUT /endpoints/:id` (Bearer JWT)
- `DELETE /endpoints/:id` (Bearer JWT)

### Reviews
- `POST /reviews` (Bearer JWT)
  - Body: `{ endpointId, rating(1..5) }`
- `GET /reviews/endpoint/:endpointId`
- `GET /reviews/endpoint/:endpointId/average`
- `GET /reviews/my-review/:endpointId` (Bearer JWT)

### Proxy (paid)
- `ALL /:username/:endpointName`
  - Applies x402 paywall then forwards to `originalUrl`

### MCP
- `GET /mcp`
  - Lists available MCP servers (users with at least one endpoint)
- `POST /mcp/:username` (MCP protocol; paywall for tool calls)
- `GET /mcp/:username` (session operations)
- `DELETE /mcp/:username` (session cleanup)

---

## Pricing and tokens
- `paymentAmount`: decimal in the token’s standard units (e.g., `0.05` USDC)
- `tokenType`: SPL mint address (e.g., USDC mainnet: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)
- Network: `mainnet-beta` (config within paywall)

---

## Example AI endpoints (optional showcase)
- `POST /ai/text` → `{ prompt, temperature }`
- `POST /ai/image` → `{ prompt, size, n }` and saves images under `/uploads/ai-generated`

---

## Testing payments (advanced)
Examples are provided under `src/test/`:
- `test-api-paywall.ts`: Demonstrates making a paid request using Faremeter fetch wrapper and a local keypair (`payer-wallet.json`)
- `test-mcp-paywall.ts`: Demonstrates an MCP proxy that conditionally applies payments

Note: These are illustrative and not wired into `npm test`. Review keys and network before running.

---

## Development scripts
```bash
# Lint & format
npm run lint
npm run format

# Drizzle
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
```