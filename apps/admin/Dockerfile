FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/admin/package.json ./apps/admin/package.json

RUN pnpm install --frozen-lockfile || pnpm install

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/admin/ ./apps/admin/

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter=@kopipos/shared-types build || true
RUN pnpm --filter=@kopipos/shared-utils build || true
RUN pnpm --filter=@kopipos/admin build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/apps/admin/public ./apps/admin/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/admin/server.js"]
