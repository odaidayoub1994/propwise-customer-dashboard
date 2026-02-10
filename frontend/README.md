# Propwise Frontend

Next.js dashboard with server-side prefetch, real-time WebSocket updates, and admin mode toggle.

See the [root README](../README.md) for full project setup and architecture overview.

## Tech Stack

- Next.js 16 (App Router, Server Components)
- React 19
- TanStack Query 5 (server state management)
- Axios (HTTP client)
- Socket.IO Client 4.8 (real-time events)
- Tailwind CSS 4 + tw-animate-css
- shadcn/ui (Radix-based component library)
- next-themes (dark/light/system mode)
- Sonner (toast notifications)
- Lucide React (icons)

## Features

- Sidebar layout with navigation, admin toggle, theme switch, and connection status
- Customer data table with column sorting (name, date), pagination, and configurable page size
- Stats cards showing customer metrics at a glance
- Polished table UI with zebra rows, inline row actions, and column separators
- Responsive layout with horizontal scroll to always display all columns
- Full-text search across name and email (minimum 3 characters, debounced, auto-trimmed)
- Date range filtering with from/to date pickers and auto-fill
- Create and edit customers via polished modal forms with validation
- Single and bulk delete with confirmation dialog
- Admin mode toggle — reveals sensitive fields (`national_id`, `internal_notes`) via `x-internal` header
- Dark/light/system theme toggle (persisted via next-themes)
- WebSocket connection status badge (connected/reconnecting indicator)
- Real-time toast notifications for CRUD events from other clients
- Server-side data prefetch — no loading spinner on initial page load

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                     Root layout (fonts, providers, metadata)
│   ├── page.tsx                       Home page (server-side prefetch + HydrationBoundary)
│   ├── loading.tsx                    Skeleton UI for page transitions
│   ├── error.tsx                      Error boundary with retry button
│   └── globals.css                    Tailwind + custom styles
├── features/customers/
│   ├── api.ts                         Axios endpoint functions (CRUD, uses internalHeaders)
│   ├── keys.ts                        Query keys via createEntityKeys factory
│   ├── types.ts                       Customer, CustomerQuery (re-exports shared API types)
│   ├── constants.ts                   Default query params (page size, sort, search min)
│   ├── socket-events.ts              Socket event name constants
│   ├── components/
│   │   ├── CustomerTable.tsx          Main data table with sorting, selection, actions
│   │   ├── CustomerRow.tsx            Individual table row component
│   │   ├── CustomerFormModal.tsx      Create/edit dialog with form validation
│   │   ├── CustomerTableEmpty.tsx     Empty state component
│   │   ├── CustomerPageHeader.tsx     Page header with title
│   │   ├── DeleteConfirmModal.tsx     Delete confirmation dialog
│   │   ├── SearchBar.tsx              Search input with debounce
│   │   ├── DateRangeFilter.tsx        Date range from/to pickers
│   │   ├── BulkActionBar.tsx          Bulk delete action bar
│   │   ├── StatsCards.tsx             Customer stats cards (total, filtered)
│   │   └── ToastNotifications.tsx     Socket-driven toast notification listener
│   └── hooks/                         Thin wrappers around shared hooks
│       ├── useCustomers.ts            Wraps usePaginatedQuery for customer list
│       ├── useCustomerMutations.ts    Create/update/delete/bulk-delete (uses getErrorMessage)
│       ├── useCustomerFilters.ts      Wraps useTableFilters with customer defaults
│       └── useSocket.ts              Wraps useEntitySocket with customer events
├── components/
│   ├── AppLayout.tsx                  Sidebar layout wrapper
│   ├── AppSidebar.tsx                 Sidebar with nav, admin toggle, theme toggle, connection status
│   ├── AdminToggle.tsx                Admin mode switch (public/internal)
│   ├── ConnectionStatus.tsx           WebSocket connection status badge
│   ├── Pagination.tsx                 Reusable pagination controls
│   ├── ThemeToggle.tsx                Dark/light/system theme switch
│   ├── Providers.tsx                  Provider composition wrapper
│   └── ui/                            shadcn/ui primitives (button, dialog, input, table, sheet, etc.)
├── context/
│   ├── AdminContext.tsx               Admin mode state (localStorage + useSyncExternalStore)
│   └── SocketContext.tsx              Singleton Socket.IO client instance
├── hooks/                             Shared reusable hooks
│   ├── useDebouncedValue.ts           Debounced value hook
│   ├── useSelection.ts               Table row selection (toggle one/all/clear)
│   ├── useTableFilters.ts            Generic filter/sort/pagination state
│   ├── usePaginatedQuery.ts          Generic paginated list query (keepPreviousData + isInternal)
│   └── useEntitySocket.ts            Generic socket event wiring + cache invalidation
├── lib/                               Utilities and configuration
│   ├── fetcher.ts                     Axios instance (baseURL, x-internal header injection)
│   ├── react-query.ts                 makeQueryClient() factory (staleTime: 30s)
│   ├── error.ts                       getErrorMessage() for mutation error handling
│   ├── api-helpers.ts                 internalHeaders() for x-internal header
│   ├── query-keys.ts                  createEntityKeys<T>() factory for query key hierarchy
│   ├── format.ts                      Date/time formatting utilities
│   └── utils.ts                       cn() utility (clsx + tailwind-merge)
├── types/                             Shared type definitions
│   └── api.ts                         PaginatedResponse<T>, BulkDeleteResponse
└── config/
    └── env.config.ts                  NEXT_PUBLIC_API_URL with default
```

## State Management

Three layers handle different types of state:

**Server state — TanStack Query 5**
- All API data fetched and cached via TanStack Query
- Query keys include `isInternal` flag to separate public and admin caches client-side
- `staleTime: 30s` prevents unnecessary refetches on component remounts
- `keepPreviousData` keeps old data visible during page/search/sort transitions
- Server-side prefetch via `queryClient.prefetchQuery()` in Server Components (no loading spinner on first render)

**Client state — React Context**
- `AdminContext` — admin mode toggle backed by `localStorage` and `useSyncExternalStore` for sync access across components
- `SocketContext` — singleton Socket.IO client instance shared across the app

**URL state**
- `useCustomerFilters` hook wraps the shared `useTableFilters` with customer-specific defaults (sort column, page size, date autofill delay)

## Real-Time Updates

- Socket.IO Client connects to the backend WebSocket gateway on mount
- `useSocket` hook wraps the shared `useEntitySocket` with customer-specific events (`customer.created`, `customer.updated`, `customer.deleted`, `customers.bulk_deleted`)
- On each event: displays a Sonner toast notification and invalidates TanStack Query cache (triggers automatic refetch)
- `ConnectionStatus` component shows a badge indicating connection state (connected/reconnecting)

## Scalability Architecture

Shared hooks and utilities live in `hooks/`, `lib/`, and `types/`. Feature-specific code in `features/<name>/` wraps them with entity-specific config.

### Shared Utilities

| File | Purpose |
|------|---------|
| `lib/error.ts` | `getErrorMessage()` — extract API error messages for mutation toast notifications |
| `lib/api-helpers.ts` | `internalHeaders()` — build `x-internal` header object |
| `lib/query-keys.ts` | `createEntityKeys<TQuery>(entity)` — generate TanStack Query key hierarchy |
| `types/api.ts` | `PaginatedResponse<T>`, `BulkDeleteResponse` — shared API response types |
| `hooks/useSelection.ts` | Table row selection (toggle one/all/clear) |
| `hooks/useTableFilters.ts` | Generic filter/sort/pagination state with configurable defaults |
| `hooks/usePaginatedQuery.ts` | Paginated list query with `keepPreviousData` + `isInternal` injection |
| `hooks/useEntitySocket.ts` | Socket event wiring with TanStack Query cache invalidation |

### Scaffolding a New Feature

To add a new entity (e.g., `orders`):

1. Create `features/orders/types.ts` — entity interface, query params, sort columns
2. Create `features/orders/constants.ts` — default page, sort, search config
3. Create `features/orders/keys.ts` — `createEntityKeys<OrderQuery>('orders')`
4. Create `features/orders/api.ts` — endpoint functions using `internalHeaders()`
5. Create `features/orders/hooks/` — thin wrappers: `useOrders` (wraps `usePaginatedQuery`), `useOrderFilters` (wraps `useTableFilters`), `useSocket` (wraps `useEntitySocket`), mutation hooks (use `getErrorMessage`)
6. Create `features/orders/components/` — table, form modal, etc.

## Theming

- `next-themes` with `attribute="class"` and `enableSystem` for three modes: light, dark, system
- `ThemeToggle` component cycles through modes
- shadcn/ui components adapt automatically via Tailwind CSS variables

## Testing

37 unit tests covering pure utilities and the API layer using Vitest + happy-dom.

```bash
pnpm run test          # Run all tests
pnpm run test:watch    # Watch mode
pnpm run test:cov      # Coverage report
```

Test files are co-located with source files as `*.spec.ts`:

| Category | Files | Tests | What's Covered |
|----------|-------|-------|----------------|
| Pure utilities | 10 | 29 | Error handling, API helpers, query keys, date formatting, Tailwind utils, QueryClient factory, customer constants, socket events, env config |
| API layer | 1 | 8 | All 6 customer API functions — correct HTTP method, URL, params, headers, response extraction |

Test infrastructure:
- `vitest.config.mts` — Vitest config with happy-dom, `@` path alias, v8 coverage
- `src/test/setup.ts` — jest-dom matchers for DOM assertions
- `src/test/fixtures.ts` — shared mock data (customer objects, paginated responses)

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Development server on port 3000 |
| `pnpm run build` | Production build |
| `pnpm run start` | Production server |
| `pnpm run lint` | Lint check |
| `pnpm run test` | Run unit tests |
| `pnpm run test:watch` | Tests in watch mode |
| `pnpm run test:cov` | Tests with coverage report |

## Environment Variables

Create `frontend/.env.local` for local overrides. `NEXT_PUBLIC_*` vars are inlined at build time.

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API URL |
