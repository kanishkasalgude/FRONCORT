# API Documentation

This document describes the RESTful endpoints provided by the `workspace-api`.

## Authentication & Identity

All protected routes require an `Authorization: Bearer <token>` header, which can be obtained via `/api/auth/login`.

### `POST /api/auth/register`
- **Purpose**: Register a new user and create their first organization.
- **Auth**: None
- **Body**: `{ "email": "user@example.com", "password": "...", "orgName": "My Org" }`
- **Response**: `201 Created` - `{ "accessToken": "jwt...", "user": { ... }, "org": { ... } }`

### `POST /api/auth/login`
- **Purpose**: Authenticate a user and return tokens.
- **Auth**: None
- **Body**: `{ "email": "user@example.com", "password": "..." }`
- **Response**: `200 OK` - `{ "accessToken": "jwt...", "user": { ... } }`

### `POST /api/auth/refresh`
- **Purpose**: Refresh an expired access token using the `httpOnly` refresh cookie.
- **Auth**: Requires `refreshToken` cookie.
- **Response**: `200 OK` - `{ "accessToken": "jwt..." }`

### `PATCH /api/auth/switch-org`
- **Purpose**: Switch the active organization context for the current session.
- **Auth**: Required
- **Body**: `{ "orgId": "uuid" }`
- **Response**: `200 OK` - `{ "accessToken": "new_jwt..." }`

### `GET /api/auth/me`
- **Purpose**: Get current user profile and available organizations.
- **Auth**: Required + `resolveActiveOrg`
- **Response**: `200 OK` - `{ "id": "uuid", "email": "...", "organizationId": "...", "organizations": [...] }`

---

## Support Module

All Support endpoints require Authentication and Tenant Context (`resolveActiveOrg`).

### `GET /api/support/tickets`
- **Purpose**: List tickets for the current organization.
- **Auth**: Required
- **Response**: `200 OK` - `[ { "id": "...", "title": "...", "status": "OPEN" } ]`

### `POST /api/support/tickets`
- **Purpose**: Create a new support ticket.
- **Auth**: Required
- **Body**: `{ "title": "...", "description": "..." }`
- **Response**: `201 Created` - `{ "id": "...", "title": "..." }`

### `GET /api/support/feature-flags`
- **Purpose**: List feature flags for the current organization.
- **Auth**: Required
- **Response**: `200 OK` - `[ { "id": "...", "key": "...", "enabled": true } ]`

---

## Review Module

All Review endpoints require Authentication and Tenant Context (`resolveActiveOrg`).

### `GET /api/review/pull-requests`
- **Purpose**: List pull requests requiring review in the current organization.
- **Auth**: Required
- **Response**: `200 OK` - `[ { "id": "...", "status": "DRAFT", ... } ]`

### `POST /api/review/pull-requests/:id/approve`
- **Purpose**: Approve a specific pull request.
- **Auth**: Required
- **Response**: `200 OK` - `{ "status": "APPROVED" }`

---

## Sharing Module

### `POST /api/sharing/resource`
- **Purpose**: Share a ticket or PR with an external organization.
- **Auth**: Required
- **Body**: `{ "resourceType": "TICKET", "resourceId": "...", "targetOrgId": "..." }`
- **Response**: `201 Created` - `{ "id": "..." }`
