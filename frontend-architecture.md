# Phase 5A Frontend Architecture

## Overview
This document outlines the Phase 5A frontend infrastructure for the Unified Org Workspace. It covers both `support-web` and `review-web` React applications. Both applications share identical underlying architecture but differ in their business domains.

## Packages
We have extracted shared logic into a monorepo setup under `packages/`:
- **`@workspace/api-client`**: Contains the native `fetch` wrapper and typed endpoint definitions (auth, organizations, etc.). No Axios or hidden interceptors.
- **`@workspace/frontend-core`**: Provides shared React Contexts, AppProviders (Theme, Query, Auth, Toast), and will house reusable layout components (e.g., SidebarLayout).
- **`@workspace/shared-types`**: Houses all shared TypeScript interfaces (User, Organization, Session, Ticket, PullRequest, ResourceShare, Digest, Audit).
- **`@workspace/ui`**: Contains the shadcn/ui components configured with Tailwind CSS and Lucide icons.

## Applications

### 1. `support-web`
- **Tech Stack**: React, TypeScript, Vite, React Router, TailwindCSS.
- **Routes**: `/login`, `/dashboard`, `/tickets`, `/feature-flags`, `/profile`, `/settings`.

### 2. `review-web`
- **Tech Stack**: React, TypeScript, Vite, React Router, TailwindCSS.
- **Routes**: `/login`, `/dashboard`, `/pull-requests`, `/shared`, `/digests`, `/profile`, `/settings`.

## Folder Structure
Both apps adhere strictly to the requested folder structure:
```
src/
  app/
  components/
    ui/, layout/, navigation/, feedback/, forms/, tables/, dialogs/
  features/
    [Domain specific features]
  hooks/
  services/
  api/
  providers/
  lib/
  store/
  types/
  styles/
  routes/
  utils/
```

## Provider Order
Inside `@workspace/frontend-core/AppProviders`:
1. `QueryClientProvider` (TanStack Query)
2. `AuthProvider` (Identity & Session)
3. `OrganizationProvider` (Current Org Context)
*(The Router is handled via `RouterProvider` within each App's `routes/index.tsx` which wraps the inner content).*

## Authentication Flow
1. User hits a protected route (e.g., `/dashboard`).
2. `ProtectedRoute` wrapper checks `useAuth().session`.
3. If no session, navigates to `/login`.
4. The `AuthProvider` fetches `/api/auth/me` on mount to re-establish session.

## State Management
We explicitly avoid global state managers like Redux or Zustand.
- **Server State**: Managed via TanStack Query and our explicit API client.
- **Auth/Org State**: Managed via simple React Contexts (`AuthProvider`, `OrganizationProvider`).
- **Form State**: Will be managed via React Hook Form + Zod.
