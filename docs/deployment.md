# Deployment Guide

The Unified Workspace is designed for rapid containerized deployment via Docker.

## Production Requirements
- **Docker & Docker Compose**: Essential for orchestrating the application stack.
- **PostgreSQL 14+**: A production-grade relational database engine.
- **Environment Variables**:
  - `DATABASE_URL`: Connection string to the PostgreSQL database.
  - `JWT_SECRET`: A secure 256-bit secret key (e.g., generated via `openssl rand -hex 32`).
  - `JWT_EXPIRES_IN`: Recommended `1h`.
  - `GEMINI_API_KEY`: (Optional) If omitted, the digest service defaults to a deterministic local fallback.

## Deployment Steps
1. Clone the repository to the production server.
2. Copy `.env.example` to `.env` and populate secrets.
3. Bring down any existing containers:
   ```bash
   docker-compose down
   ```
4. Build and run the isolated microservices:
   ```bash
   docker-compose up --build -d
   ```
5. Apply database migrations:
   ```bash
   docker-compose exec workspace-api npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
   ```

*Note: The `docker-compose.yml` file is configured to parameterize environment variables, ensuring hardcoded secrets do not leak into the image.*
