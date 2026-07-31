# System Architecture

The Unified Workspace platform is a B2B SaaS application handling customer support and pull request reviews across multiple isolated organizations. It is built as a monorepo consisting of a shared database package and isolated APIs/frontends.

## 1. High-Level Architecture
- **Workspace API (`apps/workspace-api`)**: Express.js REST API providing backend services for authentication, ticketing, reviews, and digests.
- **Support Web (`apps/support-web`)**: Next.js (React) dashboard for customer support agents dealing with Tickets.
- **Review Web (`apps/review-web`)**: Next.js (React) dashboard for engineering reviewers dealing with Pull Requests.
- **Database (`packages/database`)**: PostgreSQL, accessed via Prisma ORM.

## 2. Authentication & Authorization
- **Authentication Strategy**: Stateless JWT tokens containing `userId`, `sessionId`, `role`, and `activeOrgId`. There are no refresh tokens implemented; session expiration relies purely on JWT expiry and session store (if enforced).
- **Tenant Isolation**: Multi-tenant architecture with logical separation at the application layer. The `resolveActiveOrg` middleware extracts the tenant from the JWT, verifies membership via the database, and injects `orgId` into the request for controllers to append to Prisma filters.

## 3. Data Integrity & Security
- **Cross-Organization Data Segregation**: Every query to Prisma must manually filter by the injected `orgId`. A specialized `DigestService` integration test proves this isolation mathematically.
- **Audit Logging**: An `AuditLog` table stores all significant actions. A PostgreSQL database-level trigger strictly enforces an append-only policy, preventing `UPDATE` or `DELETE` commands natively.
- **LLM Digestion**: An AI-powered digest generation service uses Google's Gemini API (`gemini-2.5-flash`) via HTTP to summarize audit logs. The execution flow is strictly defined as: `Scheduler -> Audit Repository -> Digest Service -> Gemini Provider -> Fallback Provider -> Database`. The configuration relies on `LLM_API_KEY` and `LLM_MODEL` environment variables. If the AI provider fails or the API key is missing, it transparently triggers the `FallbackProvider` to ensure digest generation never fails.
