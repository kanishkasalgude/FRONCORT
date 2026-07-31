# Local Setup Guide

Follow these steps to set up the Unified Workspace environment on your local development machine.

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Docker (for local PostgreSQL instance)

## Step-by-Step Setup
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Database**
   ```bash
   docker-compose up db -d
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL="postgresql://postgres:170806@localhost:5433/froncort"
   JWT_SECRET="<YOUR_SECURE_GENERATED_SECRET>"
   JWT_EXPIRES_IN="1h"
   GEMINI_API_KEY="<OPTIONAL_API_KEY>"
   ```

4. **Initialize the Database**
   Apply migrations, including the append-only audit trigger:
   ```bash
   npm run db:push --workspace=@workspace/database
   npx prisma migrate dev --schema=packages/database/prisma/schema.prisma
   ```

5. **Seed the Database**
   Populate the database with test data for Stark Industries and Wayne Enterprises:
   ```bash
   npm run seed --workspace=@workspace/database
   ```

6. **Start the Application**
   ```bash
   npm run dev
   ```

## Running Tests
To run the integration tests ensuring tenant data isolation:
```bash
npm run test --workspace=workspace-api
```
