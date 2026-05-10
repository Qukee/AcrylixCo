# syntax=docker/dockerfile:1.7

# AcrylixCo — production image for Railway.
# Builds the Next.js app at site/ inside a multi-stage image.
# Runtime applies Drizzle migrations on boot, then starts Next.

# ---- builder ---------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps (cached on package*.json change).
COPY site/package.json site/package-lock.json ./site/
WORKDIR /app/site
RUN npm ci

# Copy the rest of the site source and build.
WORKDIR /app
COPY site ./site
WORKDIR /app/site
RUN npm run build

# ---- runner ----------------------------------------------------------------
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/site

# Copy built app + node_modules (drizzle-kit lives in devDependencies and is
# needed at runtime for the migration step, so we keep all node_modules).
COPY --from=builder /app/site/.next ./.next
COPY --from=builder /app/site/public ./public
COPY --from=builder /app/site/node_modules ./node_modules
COPY --from=builder /app/site/package.json ./package.json
COPY --from=builder /app/site/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/site/src/db ./src/db
COPY --from=builder /app/site/tsconfig.json ./tsconfig.json
COPY --from=builder /app/site/next.config.ts ./next.config.ts

EXPOSE 3000

# Apply migrations, then start. Migrations are idempotent.
# We tolerate migration failures (e.g. when DATABASE_URL isn't yet wired) so
# the app still comes up — auth routes will fail until DB is reachable, but
# the home page renders, which makes diagnosis straightforward.
CMD ["sh", "-c", "echo 'PORT=' $PORT; echo 'DATABASE_URL prefix=' $(printf %s \"$DATABASE_URL\" | cut -c1-30); (npx drizzle-kit migrate || echo 'WARN: drizzle-kit migrate failed — continuing'); exec npm run start"]
