FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package configurations
COPY package.json package-lock.json ./

# Copy all packages and apps package.jsons (to leverage Docker cache)
COPY packages/shared/package.json packages/shared/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
COPY apps/workspace-api/package.json apps/workspace-api/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build the shared packages and the API
RUN npm run build --workspace=@workspace/shared
RUN npm run build --workspace=@workspace/shared-types
RUN npm run build --workspace=@workspace/database
RUN npm run build --workspace=@workspace/api

FROM node:20-alpine AS runner

WORKDIR /app

# Copy package info
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema and generated client
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json

# Copy shared packages dists
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-types/package.json ./packages/shared-types/package.json

# Copy API dist
COPY --from=builder /app/apps/workspace-api/dist ./apps/workspace-api/dist
COPY --from=builder /app/apps/workspace-api/package.json ./apps/workspace-api/package.json

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start command
CMD ["node", "apps/workspace-api/dist/server.js"]
