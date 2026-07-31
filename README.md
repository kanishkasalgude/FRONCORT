# Unified Workspace

Unified Workspace is a monorepo containing multiple frontend applications connected to a single API backend. It provides role-based access control, ticketing, feature flags, pull requests, and sharing capabilities.

## Architecture Overview

- **Backend**: Node.js + Express API (`apps/workspace-api`) using Prisma ORM with PostgreSQL.
- **Frontends**: 
  - **Support Hub** (`apps/support-web`): Vite + React + TypeScript
  - **Review Console** (`apps/review-web`): Vite + React + TypeScript
- **Shared Packages**: 
  - `@workspace/ui`: Reusable Radix/Tailwind components
  - `@workspace/frontend-core`: Shared React Query hooks and layouts
  - `@workspace/api-client`: Unified fetch/axios client for backend
  - `@workspace/database`: Prisma schema and client
  - `@workspace/shared-types`: Common DTOs

## Installation & Setup

1. Copy `.env.example` to `.env`.
2. Ensure you have Node.js 20+ and Docker installed.
3. Run `npm install` to bootstrap the monorepo.
4. Run `npx prisma migrate dev` in `packages/database` or `npm run db:setup` if script exists.

## Running Development

```bash
npm run dev
```

This starts the API (port 3000), Support Web (port 3001), and Review Web (port 3002).

## Docker Setup

To run the full stack in production mode via Docker:

```bash
docker-compose up -d --build
```

- API is available at `http://localhost:4000`
- Support Web is available at `http://localhost:3001`
- Review Web is available at `http://localhost:3002`

## AI Digest & Append-Only Audit

- **AI Digest**: Summarizes daily events per organization using LLMs with a fallback to deterministic generation.
- **Append-Only Audit**: Audit logs are enforced at the PostgreSQL database level using triggers to prevent modifications.

## Tests
The monorepo relies on Vitest for integration and unit testing.
```bash
npm run test --workspaces
```

## Documentation

Detailed architectural, deployment, and API specifications are available in the `docs/` directory:
- [Architecture & Design](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment & Setup Guide](docs/deployment.md)
- [Limitations & Future Improvements](docs/limitations.md)
