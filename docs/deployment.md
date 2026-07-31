# Deployment & Setup Guide

This document outlines how to run, test, and deploy the Unified Workspace monorepo.

## Requirements
- **Node.js**: v20 or higher
- **NPM**: v10 or higher
- **Docker**: Engine 24+ and Docker Compose v2+

## Environment Variables

Copy the `.env.example` file to `.env` at the root of the repository:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: Connection string for PostgreSQL (e.g., `postgresql://user:password@localhost:5432/workspace_db`)
- `JWT_SECRET`: A strong 256-bit secret key for token signing.
- `JWT_EXPIRES_IN`: Access token lifespan (default: `1d`).

Optional AI Digest variables:
- `LLM_API_KEY`: API key for the LLM provider.
- `LLM_PROVIDER`: The LLM provider to use (e.g., `openai`, `gemini`).
- `LLM_MODEL`: Model string (e.g., `gpt-4`, `gemini-2.5-flash`).
- `LLM_BASE_URL`: Base URL if using an OpenAI-compatible proxy or alternative provider.

## Local Setup (Native Node + Docker DB)

1. Start the local PostgreSQL database using Docker:
   ```bash
   docker-compose up db -d
   ```
2. Install monorepo dependencies:
   ```bash
   npm install
   ```
3. Run database migrations:
   ```bash
   npx prisma migrate dev --schema=packages/database/prisma/schema.prisma
   ```
4. Seed the database (optional):
   ```bash
   npx ts-node packages/database/seed.ts
   ```
5. Start the development servers concurrently:
   ```bash
   npm run dev
   ```
   - API runs on `http://localhost:3000`
   - Support Web runs on `http://localhost:3001`
   - Review Web runs on `http://localhost:3002`

## Full Docker Setup

To run the entire stack inside Docker containers:
```bash
docker-compose up -d --build
```
This builds the API and both frontend images, starts PostgreSQL, automatically applies Prisma migrations, and exposes the services.

## Running Tests

The repository uses Vitest for testing across all packages and applications.
```bash
# Run all tests in the monorepo
npm run test --workspaces
```

## Building for Production

To build the TypeScript packages and the Vite frontends:
```bash
npm run build --workspaces
```
This compiles the Express app into `dist/` and builds optimized static assets for the React apps.

## Production Deployment

For production, it is recommended to:
1. Deploy PostgreSQL as a managed service (e.g., AWS RDS, Supabase).
2. Deploy the `workspace-api` as a Node.js Docker container (using `apps/workspace-api/Dockerfile`).
3. Deploy `support-web` and `review-web` static builds to a CDN or static host (Vercel, AWS S3/CloudFront). 
   - Note: The current `Dockerfile` for the frontends uses Nginx to serve the static assets if you prefer containerized frontend hosting.
