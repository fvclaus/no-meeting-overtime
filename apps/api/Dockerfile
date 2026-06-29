FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
# pnpm-workspace.yaml is required so pnpm picks up `allowBuilds` (esbuild,
# protobufjs, sharp); without it `pnpm i` fails with ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm i -g pnpm
RUN pnpm i

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Avoid errors during NextJS prerendering
ENV CLIENT_SECRET='foo'
ENV CLIENT_ID='foo'
ENV KEY_FILE='foo'
ENV PROJECT_ID='foo'
ENV QUEUE_LOCATION='foo'
ENV SITE_BASE='foo'
ENV CLOUD_TASKS_SERVICE_ACCOUNT='foo'

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM gcr.io/distroless/nodejs22 AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

# TODO
#RUN addgroup --system --gid 1001 nodejs
#RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
#RUN mkdir .next
#RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
# Next's standalone tracer misses @google-cloud/tasks' lazily-required JSON
# config files (e.g. cloud_tasks_client_config.json), which are only loaded
# when the CloudTasksClient is constructed at runtime -> MODULE_NOT_FOUND 500.
# Copy the full package over the traced output. See vercel/next.js#63368.
# NOTE: the version below must match @google-cloud/tasks in package.json; a
# mismatch fails the build loudly (path not found) rather than 500ing at runtime.
COPY --from=builder /app/node_modules/.pnpm/@google-cloud+tasks@6.2.3/node_modules/@google-cloud/tasks/ ./node_modules/.pnpm/@google-cloud+tasks@6.2.3/node_modules/@google-cloud/tasks/
COPY --from=builder /app/.next/static ./.next/static

#USER nextjs
# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["server.js"]
