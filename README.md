# Propwise Customer Activity Dashboard

Full-stack Customer Activity Dashboard built with NestJS, Next.js, PostgreSQL, Redis, and Socket.IO.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm (`npm install -g pnpm`)

## Quick Start

```bash
# Install all dependencies
pnpm run install:all

# Start everything (infra + backend + frontend) in one command
pnpm run dev
```

Backend at http://localhost:4000, Frontend at http://localhost:3000.

Seed the database (requires infra running):
```bash
pnpm run seed
```

**Alternative: step-by-step setup**
```bash
docker compose up -d postgres redis   # Start infra

cd backend && pnpm install && pnpm run seed && pnpm run start:dev
cd frontend && pnpm install && pnpm run dev
```

**Full Docker stack** (all services):
```bash
pnpm run docker:up      # Backend on :4000, Frontend on :3000
pnpm run docker:build   # Rebuild after code changes
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/customers` | List customers (paginated, searchable, sortable, filterable) |
| GET | `/customers/:id` | Get a single customer by ID |
| POST | `/customers` | Create a new customer |
| PUT | `/customers/:id` | Update an existing customer |
| DELETE | `/customers/:id` | Delete a single customer |
| DELETE | `/customers` | Bulk delete customers (body: `{ ids: [...] }`) |

All endpoints accept an `x-internal: true` header for admin mode, which reveals sensitive fields (`national_id`, `internal_notes`).

Swagger docs available at [http://localhost:4000/api/docs](http://localhost:4000/api/docs).

## Sensitive Data Protection (4-Layer Defense)

1. **Service-level write guard** — `create()` and `update()` strip `national_id`/`internal_notes` from the DTO when `isInternal` is false, protecting all callers (controller, jobs, scripts)
2. **Output interceptor** — `SensitiveFieldsInterceptor` recursively strips sensitive fields from API responses in public mode
3. **Cache sanitization** — public-mode Redis caches store pre-sanitized data (sensitive fields stripped before caching, not after)
4. **Cache key isolation** — every cache key includes `isInternal` flag, preventing internal cached data from being served to public requests

## Redis Caching Strategy

- **Lists**: version-based invalidation — `INCR customers:list:version` on mutations, version embedded in cache key. O(1) instead of SCAN+DEL.
- **Details**: explicit `DEL` on update/delete (both `:true` and `:false` variants)
- **TTL**: configurable via `CACHE_TTL` env var (default 60s)
- **Graceful degradation**: Redis failures log a warning and fall through to database

## TanStack Query Cache

- `isInternal` embedded in every query key — public and admin caches are separate client-side
- `staleTime: 30s` — prevents unnecessary refetches on component remounts
- `keepPreviousData` — old data stays visible during page/search/sort transitions
- Server-side prefetch on initial page load — no loading spinner on first render

## WebSocket Events

| Event | Payload | Description |
|-------|---------|-------------|
| `customer.created` | `{ id, full_name, email, phone_number, created_at, updated_at }` | New customer created |
| `customer.updated` | `{ id, full_name, email, phone_number, created_at, updated_at }` | Customer updated |
| `customer.deleted` | `{ id }` | Customer deleted |
| `customers.bulk_deleted` | `{ ids }` | Multiple customers deleted |

Payloads never include sensitive fields. Clients receive toast notifications and auto-refetch data via TanStack Query invalidation.

## Architecture Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Version-based list cache invalidation | O(1) writes, but stale list caches persist until TTL expires (acceptable for dashboard use case) |
| 4-layer sensitive field defense | Redundant checks add minimal overhead but prevent accidental leaks at every layer |
| `isInternal` in cache keys | Doubles cache entries for the same data, but prevents cross-mode data leaks |
| Server Component prefetch | Faster initial load, but prefetched data is always public mode (admin toggle requires client refetch) |
| `keepPreviousData` | Smoother UX during transitions, but briefly shows stale data |
| UUID primary keys | Prevents ID enumeration, but larger than auto-increment integers |
| Single endpoint with header | Simpler routing than separate `/internal` endpoints, but requires consistent header handling |

## Environment Variables

### Backend (`backend/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `DB_HOST` | — | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | — | PostgreSQL user |
| `DB_PASSWORD` | — | PostgreSQL password |
| `DB_NAME` | — | PostgreSQL database |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `CORS_ORIGIN` | `*` | Allowed CORS origin |
| `CACHE_TTL` | `60` | Redis cache TTL in seconds |

### Frontend (`frontend/.env.local`)
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API URL |
