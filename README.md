# Propwise Customer Activity Dashboard

Full-stack Customer Activity Dashboard built with NestJS, Next.js, PostgreSQL, Redis, and Socket.IO.

## Tech Stack

- **Backend**: NestJS 11, TypeORM 0.3, PostgreSQL 16, Redis 7, Socket.IO 4.8, Winston, Swagger
- **Frontend**: Next.js 16, React 19, TanStack Query 5, Axios, Socket.IO Client 4.8, Tailwind CSS 4, shadcn/ui, next-themes, Sonner
- **Infrastructure**: Docker Compose, pnpm monorepo
- **Testing**: Jest (127 unit tests)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- pnpm (`npm install -g pnpm`)

## Project Structure

```
propwise-customer-dashboard/
├── backend/src/
│   ├── config/              env, database, logger configuration
│   ├── customers/
│   │   ├── dto/             create, update, query, bulk-delete DTOs
│   │   ├── entities/        TypeORM Customer entity
│   │   ├── interceptors/    sensitive field stripping
│   │   ├── types/           socket event payload types
│   │   └── utils/           isInternalRequest, stripSensitive, escapeIlike
│   ├── cache/               Redis cache service (get/set/delete/version)
│   ├── redis/               ioredis client factory
│   ├── socket/              WebSocket gateway + event service
│   └── filters/             global exception filter
├── frontend/src/
│   ├── app/                 Next.js App Router (layout, page, loading, error)
│   ├── features/customers/
│   │   ├── components/      CustomerTable, Row, FormModal, DeleteModal, SearchBar, Toasts
│   │   └── hooks/           useCustomers, useCustomerMutations, useCustomerFilters, useSocket
│   ├── components/          AdminToggle, Pagination, ThemeToggle, ConnectionStatus, ui/
│   ├── context/             AdminContext, SocketContext
│   ├── hooks/               useDebouncedValue, useSelection, useTableFilters, usePaginatedQuery, useEntitySocket
│   ├── lib/                 Axios fetcher, QueryClient factory, error helpers, query key factory
│   ├── types/               Shared API types (PaginatedResponse, BulkDeleteResponse)
│   └── config/              env config
├── docker-compose.yml
└── package.json             root monorepo scripts
```

Feature-based co-location: domain code lives in `features/<name>/`, shared code in `components/` and `lib/`.

See [backend README](./backend/README.md) and [frontend README](./frontend/README.md) for package-specific details.

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

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start everything (infra + backend + frontend) with colored output |
| `pnpm run dev:backend` | Start backend only (watch mode) |
| `pnpm run dev:frontend` | Start frontend only |
| `pnpm run infra` | Start PostgreSQL + Redis containers (detached) |
| `pnpm run infra:down` | Stop all Docker containers |
| `pnpm run build` | Build both backend and frontend |
| `pnpm run build:backend` | Build backend only |
| `pnpm run build:frontend` | Build frontend only |
| `pnpm run lint` | Lint both packages |
| `pnpm run lint:backend` | Lint backend only |
| `pnpm run lint:frontend` | Lint frontend only |
| `pnpm run format` | Format backend code (Prettier) |
| `pnpm run test` | Run backend unit tests |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run test:cov` | Run tests with coverage report |
| `pnpm run seed` | Seed database with 50 sample customers |
| `pnpm run docker:up` | Start full Docker stack (all services) |
| `pnpm run docker:down` | Stop full Docker stack |
| `pnpm run docker:build` | Rebuild and start Docker stack |
| `pnpm run install:all` | Install dependencies in both packages |

Per-package scripts are documented in each package's README ([backend](./backend/README.md), [frontend](./frontend/README.md)).

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

## Database Schema

### Customers

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK, auto-generated | |
| `full_name` | varchar(255) | NOT NULL | |
| `email` | varchar(255) | UNIQUE, NOT NULL | |
| `phone_number` | varchar(50) | NOT NULL | |
| `national_id` | varchar(100) | nullable | Sensitive |
| `internal_notes` | text | nullable | Sensitive |
| `created_at` | timestamp | auto-generated | |
| `updated_at` | timestamp | auto-updated | |

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
| `customer.created` | `{ id, full_name, email }` | New customer created |
| `customer.updated` | `{ id, full_name, email }` | Customer updated |
| `customer.deleted` | `{ id }` | Customer deleted |
| `customers.bulk_deleted` | `{ ids }` | Multiple customers deleted |

Payloads are intentionally minimal — no sensitive fields, no full entity. Clients receive toast notifications and auto-refetch full data via TanStack Query invalidation.

## Architecture Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Version-based list cache invalidation | O(1) writes via `INCR`, but all list caches become stale at once (a single edit invalidates every page/sort/filter combination). Acceptable for dashboard scale; per-page invalidation would add complexity. |
| 4-layer sensitive field defense | Redundant checks add minimal overhead but prevent accidental leaks at every layer — if one layer fails, others catch it |
| `isInternal` in cache keys | Doubles cache entries for the same data, but prevents cross-mode data leaks |
| Minimal socket payloads | Events emit only `{ id, full_name, email }` — no sensitive fields, no full entity. Clients must refetch for complete data, but this avoids accidental leakage over WebSocket |
| Invalidation over optimistic updates | Mutations invalidate all queries on success rather than optimistically patching the cache. Simpler and always consistent, but users see a brief loading state after each mutation |
| Server Component prefetch | Faster initial load (no spinner), but prefetched data is always public mode — admin toggle requires a client-side refetch |
| `keepPreviousData` | Smoother UX during page/search/sort transitions, but briefly shows stale data |
| ILIKE substring search | Simple `%query%` matching with wildcard escaping. No full-text index needed at this scale, but would require one for larger datasets |
| Debounced search (300ms) | Reduces API calls during typing, but adds slight delay before results appear |
| Redis graceful degradation | If Redis is down, queries fall through to the database with a warning log. No circuit breaker — every request attempts Redis first, adding latency when Redis is unavailable |
| UUID primary keys | Prevents ID enumeration, but larger than auto-increment integers |
| Single endpoint with `x-internal` header | Simpler routing than separate `/internal` endpoints, but requires consistent header handling across all callers |
| `ValidationPipe` with `whitelist: true` | Unknown fields silently stripped from requests — provides defense-in-depth for sensitive fields but callers get no feedback about ignored fields |

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
