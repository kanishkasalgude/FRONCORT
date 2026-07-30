FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./

# Copy all packages and apps package.jsons to leverage caching
COPY packages/shared/package.json packages/shared/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/ui/package.json packages/ui/
COPY packages/frontend-core/package.json packages/frontend-core/
COPY packages/api-client/package.json packages/api-client/
COPY apps/support-web/package.json apps/support-web/

# Install dependencies
RUN npm ci

# Copy full source
COPY . .

# Set environment variables for production build
ENV NODE_ENV=production

# Build the support-web app (this will also build its package dependencies due to workspaces or tsconfig refs)
RUN npm run build --workspace=support-web

# Production stage
FROM nginx:alpine

# Copy built assets to NGINX HTML folder
COPY --from=builder /app/apps/support-web/dist /usr/share/nginx/html

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Default NGINX command is fine
CMD ["nginx", "-g", "daemon off;"]
