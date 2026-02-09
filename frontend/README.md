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

- Customer data table with column sorting (name, date), pagination, and configurable page size
- Full-text search across name and email (minimum 3 characters, debounced, auto-trimmed)
- Date range filtering with from/to date pickers and auto-fill
- Create and edit customers via modal form with validation
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
│   └── globals.css                    Tailwind + custom styles
├── features/customers/
│   ├── api.ts                         Axios endpoint functions (CRUD)
│   ├── keys.ts                        TanStack Query key builders
│   ├── types.ts                       Customer, PaginatedResponse, CustomerQuery
│   ├── constants.ts                   Default query params (page size, sort, search min)
│   ├── socket-events.ts              Socket event name constants
│   ├── components/
│   │   ├── CustomerTable.tsx          Main data table with sorting, selection, actions
│   │   ├── CustomerFormModal.tsx      Create/edit dialog with form validation
│   │   ├── DeleteConfirmModal.tsx     Delete confirmation dialog
│   │   ├── SearchBar.tsx              Search input with debounce + date range filter
│   │   └── ToastNotifications.tsx     Socket-driven toast notification listener
│   └── hooks/
│       ├── useCustomers.ts            TanStack Query hook for paginated customer list
│       ├── useCustomerMutations.ts    Create/update/delete/bulk-delete mutations
│       ├── useCustomerFilters.ts      Filter, sort, and pagination state management
│       └── useSocket.ts              Socket event listeners + query cache invalidation
├── components/
│   ├── AdminToggle.tsx                Admin mode switch (public/internal)
│   ├── ConnectionStatus.tsx           WebSocket connection status badge
│   ├── Pagination.tsx                 Reusable pagination controls
│   ├── ThemeToggle.tsx                Dark/light/system theme switch
│   ├── Providers.tsx                  Provider composition wrapper
│   └── ui/                            shadcn/ui primitives (button, dialog, input, table, etc.)
├── context/
│   ├── AdminContext.tsx               Admin mode state (localStorage + useSyncExternalStore)
│   └── SocketContext.tsx              Singleton Socket.IO client instance
├── hooks/
│   └── useDebouncedValue.ts           Debounced value hook
├── lib/
│   ├── fetcher.ts                     Axios instance (baseURL, x-internal header injection)
│   ├── react-query.ts                 makeQueryClient() factory (staleTime: 30s)
│   └── utils.ts                       cn() utility (clsx + tailwind-merge)
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
- `useCustomerFilters` hook manages filter, sort, and pagination parameters as component state

## Real-Time Updates

- Socket.IO Client connects to the backend WebSocket gateway on mount
- `useSocket` hook listens to 4 events: `customer.created`, `customer.updated`, `customer.deleted`, `customers.bulk_deleted`
- On each event: displays a Sonner toast notification and invalidates TanStack Query cache (triggers automatic refetch)
- `ConnectionStatus` component shows a badge indicating connection state (connected/reconnecting)

## Theming

- `next-themes` with `attribute="class"` and `enableSystem` for three modes: light, dark, system
- `ThemeToggle` component cycles through modes
- shadcn/ui components adapt automatically via Tailwind CSS variables

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Development server on port 3000 |
| `pnpm run build` | Production build |
| `pnpm run start` | Production server |
| `pnpm run lint` | Lint check |

## Environment Variables

Create `frontend/.env.local` for local overrides. `NEXT_PUBLIC_*` vars are inlined at build time.

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API URL |
