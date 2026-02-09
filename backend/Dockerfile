# Base — shared pnpm setup
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Dev — hot reload
FROM deps AS dev
COPY . .
CMD ["pnpm", "run", "start:dev"]

# Build
FROM deps AS build
COPY . .
RUN pnpm run build

# Production — minimal image
FROM base AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
