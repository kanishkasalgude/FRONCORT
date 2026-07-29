# Froncort Backend Architecture

This repository contains the backend infrastructure for the Froncort project. The backend is designed with a strict multi-tenant architecture, prioritizing security, isolation, and maintainability.

## System Architecture

The backend consists of **three independently deployable services** that operate within a unified ecosystem:
1. **Identity & Org Service**: Handles authentication, session management, and tenant/organization resolution.
2. **Support Hub API**: Manages support tickets, assignment routing, attachments, and feature toggles.
3. **Review & Audit API**: *(Upcoming)* Will handle pull requests, code reviews, and cross-organization audit logging.

### Key Architectural Decisions (Frozen)
* **Shared Database**: All three services share a single PostgreSQL database. This ensures strict foreign key integrity and allows for a unified, append-only audit log across all domains.
* **Stateless Token Verification**: JWT verification and organization-scoping happen locally within each service's middleware using a shared symmetric signing key. This eliminates latency-heavy network calls back to the Identity service for every request.
* **No External Caching Layer**: Redis was deliberately excluded. PostgreSQL adequately handles session lookups and background jobs at the current scale, keeping the infrastructure footprint simple and reliable.

## Features

### Identity & Security Foundation (Phase 2)
* Secure registration, login, and robust session management.
* Cryptographically hashed refresh tokens utilizing `HttpOnly` and `SameSite=Lax` cookies.
* Replay attack prevention via automatic session rotation and revocation.
* Cross-organization context switching, seamlessly issuing tenant-bound JWTs.

### Support Hub (Phase 3A)
* **Ticket Management**: Full CRUD operations for support tickets, including status transitions and strict assignment logic (users can only be assigned tickets if they are verified members of the organization).
* **Comments**: Chronological ticket commenting restricted entirely to organization members.
* **Attachments**: Treated as metadata records. Logical identifiers are stored in the database, with physical file uploads deferred to future feature requests.
* **Feature Flags**: Basic CRUD functionality for organizational feature toggles.

## Security & Multi-Tenancy

Security is the cornerstone of this API. We implement strict defense-in-depth mechanisms at the repository and middleware layers:

* **Absolute Tenant Isolation**: Every repository method explicitly requires and filters by `activeOrgId` (extracted safely from the JWT session, never from `req.body.orgId`). 
* **BOLA Protection (Broken Object Level Authorization)**: Any cross-tenant resource requests (e.g., attempting to fetch a ticket belonging to another organization) inherently return `404 Not Found`. This prevents information leakage regarding the existence of cross-org resources.
* **Layered RBAC**: Routes are strictly gated by Roles (`SUPPORT_AGENT`, `ORG_ADMIN`, `REVIEWER`) via explicit middleware pipelines.
* **Thin Controllers**: Controllers contain zero business or database logic. They exist solely to parse requests, invoke services, and standardize responses.

## Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js (v4)
* **Database ORM**: Prisma
* **Database**: PostgreSQL
* **Validation**: Zod
* **Testing**: Vitest & Supertest

## Testing & Verification

The repository contains rigorous unit and integration tests enforcing business logic and BOLA protection.

### Running Tests Locally
```bash
# Run unit and integration tests for Identity
npx vitest run src/modules/identity/

# Run unit and integration tests for Support Hub
npx vitest run src/modules/support/
```

### Manual API Testing (Postman)
We provide Postman collections to easily exercise the endpoints locally.
1. Start the API server:
   ```bash
   npx tsx apps/workspace-api/src/server.ts
   ```
2. Import the provided collections into Postman:
   * `apps/workspace-api/Identity_Collection.json`
   * `apps/workspace-api/Support_Collection.json`
3. Execute the **Register** or **Login** endpoint in the Identity collection to receive an `{{ACCESS_TOKEN}}`. Set this token as a Bearer token to authorize requests in the Support Hub collection.
