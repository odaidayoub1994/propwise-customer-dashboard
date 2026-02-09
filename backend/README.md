# Propwise Backend

NestJS REST API with PostgreSQL, Redis caching, and real-time WebSocket events.

See the [root README](../README.md) for full project setup and architecture overview.

## Tech Stack

- NestJS 11 (core, config, swagger, typeorm, websockets, platform-express, platform-socket.io)
- TypeORM 0.3 + PostgreSQL (pg 8)
- ioredis 5
- Socket.IO 4.8
- Winston 3 + nest-winston
- class-validator + class-transformer
- Jest 30 + @nestjs/testing

## Module Architecture

`AppModule` imports the following modules:

| Module | Purpose |
|--------|---------|
| `ConfigModule` | Loads `.env` into `process.env` |
| `WinstonModule` | Structured logging (JSON in production, colored in development) |
| `TypeOrmModule` | PostgreSQL connection via DataSource |
| `RedisModule` | ioredis client factory with graceful fallback on connection failure |
| `CacheModule` | Generic cache operations (get, set, delete, version-based invalidation) |
| `SocketModule` | WebSocket gateway for real-time event broadcasting |
| `CustomersModule` | Customer CRUD: controller, service, DTOs, entity, interceptor, utilities |

## Project Structure

```
src/
├── main.ts                                    Application bootstrap + Swagger setup
├── app.module.ts                              Root module
├── config/
│   ├── env.config.ts                          Centralized env var parsing (fail-fast)
│   ├── database.config.ts                     TypeORM DataSource configuration
│   └── logger.ts                              Winston format configuration
├── customers/
│   ├── customers.module.ts                    Module definition
│   ├── customers.controller.ts                REST endpoints
│   ├── customers.service.ts                   Business logic + Redis caching
│   ├── dto/
│   │   ├── create-customer.dto.ts             Create validation rules
│   │   ├── update-customer.dto.ts             Partial update (PartialType)
│   │   ├── query-customer.dto.ts              Pagination, search, sort, date filter params
│   │   └── bulk-delete.dto.ts                 Bulk delete validation (UUID array)
│   ├── entities/
│   │   └── customer.entity.ts                 TypeORM entity definition
│   ├── interceptors/
│   │   └── sensitive-fields.interceptor.ts    Recursive sensitive field stripping
│   ├── types/
│   │   └── socket-events.ts                   Socket event payload type definitions
│   └── utils/
│       ├── is-internal-request.ts             x-internal header parser (case-insensitive)
│       ├── strip-sensitive.ts                 Recursive sensitive field stripper
│       └── escape-ilike.ts                    SQL ILIKE wildcard character escaping
├── cache/
│   ├── cache.module.ts                        Cache module
│   └── cache.service.ts                       Redis get/set/delete + version operations
├── redis/
│   └── redis.module.ts                        ioredis factory provider
├── socket/
│   ├── socket.module.ts                       Socket module
│   ├── socket.gateway.ts                      WebSocket gateway (handleConnection/Disconnect)
│   ├── socket.service.ts                      Event emission service
│   └── socket-events.ts                       Centralized event name constants
└── filters/
    └── all-exceptions.filter.ts               Global exception filter
```

Every `.ts` file has a corresponding `.spec.ts` test file (omitted for brevity).

## API Endpoints

| Method | Path | Description | Query Params |
|--------|------|-------------|--------------|
| GET | `/customers` | List customers (paginated, searchable) | `page`, `limit`, `q`, `sort_by`, `sort_order`, `date_from`, `date_to` |
| GET | `/customers/:id` | Get a single customer by ID | — |
| POST | `/customers` | Create a new customer | — |
| PUT | `/customers/:id` | Update an existing customer | — |
| DELETE | `/customers/:id` | Delete a single customer | — |
| DELETE | `/customers` | Bulk delete (body: `{ ids: string[] }`) | — |

All endpoints accept an `x-internal: true` header. When present, responses include sensitive fields (`national_id`, `internal_notes`) and write operations accept them.

Swagger docs: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

## Sensitive Data Protection

4-layer defense ensures sensitive fields (`national_id`, `internal_notes`) never leak to public consumers:

1. **Service write guard** — `create()` and `update()` strip sensitive fields from the DTO when `isInternal` is false
2. **Output interceptor** — `SensitiveFieldsInterceptor` recursively strips sensitive fields from all API responses in public mode
3. **Cache sanitization** — public-mode payloads are sanitized before caching to Redis (via shared `stripSensitive()`)
4. **Cache key isolation** — every cache key includes the `isInternal` flag, so internal and public caches are never mixed

## Caching Strategy

- **List caching**: version-based invalidation. Mutations call `INCR customers:list:version`, and the version is embedded in each list cache key. This is O(1) instead of scanning and deleting all list keys.
- **Detail caching**: explicit `DEL` on update/delete (both `:internal:true` and `:internal:false` variants).
- **Key structure**: `customers:list:v${version}:internal:${isInternal}:p=${page}:l=${limit}:...` for lists, `customers:detail:${id}:internal:${isInternal}` for details.
- **TTL**: configurable via `CACHE_TTL` env var (default 60s).
- **Graceful degradation**: Redis failures log a warning and fall through to the database.

## WebSocket Events

Events are emitted via `SocketService.emitCustomerEvent()` after every mutation:

| Event | Payload | Trigger |
|-------|---------|---------|
| `customer.created` | `{ id, full_name, email }` | POST /customers |
| `customer.updated` | `{ id, full_name, email }` | PUT /customers/:id |
| `customer.deleted` | `{ id }` | DELETE /customers/:id |
| `customers.bulk_deleted` | `{ ids }` | DELETE /customers |

Payloads are intentionally minimal — no sensitive fields, no full entity. Clients refetch full data via TanStack Query invalidation.

## Error Handling

The global `AllExceptionsFilter` provides consistent error responses:

- Catches unhandled exceptions and logs full context (method, URL, stack trace)
- Maps TypeORM `QueryFailedError` with unique constraint violations to HTTP 409 Conflict
- Returns a consistent shape: `{ statusCode, message, error, timestamp, path }`
- Never exposes stack traces or SQL queries to the client

## Logging

Winston with nest-winston provides structured logging:

- `log()` — significant operations (customer created, updated, deleted)
- `warn()` — recoverable issues (Redis connection failed, cache miss)
- `error()` — failures with full context (class, method, params, error message)
- `debug?.()` — detailed flow tracing (cache hit/miss, socket events emitted)

Sensitive fields (`national_id`, `internal_notes`) are never logged.

## Testing

127 unit tests covering services, controllers, DTOs, interceptors, filters, gateway, and utilities.

```bash
pnpm run test          # Run all tests
pnpm run test:watch    # Watch mode
pnpm run test:cov      # Coverage report
```

Testing pattern: `@nestjs/testing` `Test.createTestingModule()` with all external dependencies mocked (repositories, Redis client, gateway, services).

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run start:dev` | Development server with hot reload |
| `pnpm run start` | Start without watch mode |
| `pnpm run start:prod` | Production mode (`node dist/main`) |
| `pnpm run start:debug` | Debug mode with inspector |
| `pnpm run build` | Compile to `dist/` |
| `pnpm run lint` | Lint and auto-fix |
| `pnpm run format` | Format code (Prettier) |
| `pnpm run test` | Run unit tests |
| `pnpm run test:watch` | Tests in watch mode |
| `pnpm run test:cov` | Tests with coverage report |
| `pnpm run test:e2e` | End-to-end tests |
| `pnpm run seed` | Seed database with 50 sample customers |

## Environment Variables

See `backend/.env.example` for a template.

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
