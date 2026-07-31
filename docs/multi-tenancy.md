# Multi-Tenant Data Isolation

The Unified Org Workspace implements a robust multi-tenant architecture designed to ensure strict data isolation across different organizations while utilizing a single shared database.

## Architecture

Our application uses **Logical Data Isolation**. 
All tenant-specific data is stored in shared database tables with a mandatory `orgId` column mapping the data to its respective organization. 
This provides a scalable and cost-effective approach to multi-tenancy.

### Database Schema

Every entity that belongs to an organization (e.g., `User`, `Ticket`, `PullRequest`, `FeatureFlag`, `Digest`) has a strict relation to the `Org` model.
```prisma
model Ticket {
  id        String @id @default(uuid())
  orgId     String
  org       Org    @relation(fields: [orgId], references: [id])
  // ... other fields
}
```

## Security Model and Query Scoping

Tenant isolation is enforced centrally at two levels:
1. **Middleware (`tenant.middleware.ts`)**: 
   - Resolves the active organization from the user's session or request headers (`x-org-id`).
   - Ensures the authenticated user has a valid membership to the requested organization.
   - Attaches the validated `orgId` to the request object.

2. **Repository Level (Prisma Queries)**: 
   - Data access services must *always* include the `orgId` in their Prisma query `where` clauses. 
   - This prevents Broken Object Level Authorization (BOLA) attacks.
   - If a user from Org Alpha attempts to access a resource belonging to Org Beta via a direct URL or API call, the repository query (`where: { id: resourceId, orgId: activeOrgId }`) will return nothing, resulting in a secure `404 Not Found`.

## Organization Switching Flow

The frontend handles organization switching seamlessly:

1. The user selects a different organization from the Organization Switcher UI.
2. The `OrganizationProvider` updates the `activeOrganization` state.
3. Crucially, the provider automatically calls `queryClient.invalidateQueries()`.
4. This invalidation instructs React Query to instantly discard all currently cached data (tickets, PRs, etc.) and refetch it using the new organization's context.
5. This ensures the user interface immediately reflects the new organization's data without requiring a full browser refresh, eliminating data bleeding between tenants in the UI.

### Cross-Org Sharing Exceptions

In specific scenarios, cross-organizational collaboration is supported via the `ResourceShare` and `OrgConnection` models.
- **ResourceShare**: Explicitly allows a specific resource (like a Ticket or PR) from a `sourceOrgId` to be visible or interactable by a `targetOrgId`.
- These queries intentionally bypass the strict `orgId` scoping, instead validating against the `ResourceShare` access records.

## Demonstration

The database seed script provides two completely isolated demo environments: **Organization Alpha** and **Organization Beta**.
There is zero overlap between the seeded tickets, pull requests, feature flags, and digests, allowing for clear visual verification of tenant isolation when switching organizations in the dashboard.
