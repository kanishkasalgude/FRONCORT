# Limitations & Known Issues

While the Unified Workspace meets core requirements, some limitations remain in the current iteration:

## 1. Refresh Tokens & Session Invalidation
- **Issue**: The system creates an initial stateless JWT but lacks a fully enforced refresh token rotation lifecycle. If a user logs out "everywhere," the database records the session as expired, but active short-lived JWTs might still be honored until their `exp` claim triggers.
- **Mitigation**: Keep `JWT_EXPIRES_IN` very short (e.g., 15m) to limit exposure windows.

## 2. Application-Level Data Isolation
- **Issue**: Tenant isolation is enforced manually at the Prisma ORM layer using `orgId` filters injected by middleware. This creates a risk where a developer could accidentally omit `where: { orgId }` in a new Prisma query, causing a data leak.
- **Mitigation**: We have implemented strict integration tests (e.g., `digest-isolation.integration.test.ts`). Future iterations should explore PostgreSQL Row-Level Security (RLS) for deeper enforcement.

## 3. Gemini Fallback Mechanism
- **Issue**: The `DigestService` successfully uses a FallbackProvider if the LLM API fails, but this happens per-generation. A persistent API outage could slow down the digest loop as it repeatedly hits network timeouts before falling back.
- **Mitigation**: We could implement a circuit-breaker pattern in `GeminiProvider` to temporarily skip the network call if consecutive failures occur.
