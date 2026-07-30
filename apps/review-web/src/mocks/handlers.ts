import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth
  http.post('*/api/auth/login', () => {
    return HttpResponse.json({
      user: { id: 'user-1', email: 'admin@example.com', name: 'Admin User', globalRole: 'admin', organizationId: 'org-1' },
      token: 'mock-token',
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    });
  }),
  http.get('*/api/auth/me', () => {
    return HttpResponse.json({ id: 'user-1', email: 'admin@example.com', name: 'Admin User', globalRole: 'admin', organizationId: 'org-1' });
  }),
  http.post('*/api/auth/logout', () => {
    return HttpResponse.json({});
  }),

  // Pull Requests
  http.get('*/api/pull-requests', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'PR-1',
          title: 'Implement Phase 5C Review Console',
          url: 'https://github.com/org/repo/pull/1',
          status: 'open',
          requiredApprovals: 2,
          currentApprovals: 1,
          reviewers: [
            { id: 'rev-1', userId: 'user-2', user: { id: 'user-2', name: 'Alice' }, status: 'approved', assignedAt: new Date().toISOString() },
            { id: 'rev-2', userId: 'user-3', user: { id: 'user-3', name: 'Bob' }, status: 'pending', assignedAt: new Date().toISOString() }
          ],
          version: { id: 'v1', versionNumber: 1, createdAt: new Date().toISOString(), creatorId: 'user-1', creator: { id: 'user-1', name: 'Admin User' } },
          sharingStatus: 'not_shared',
          mergeable: false,
          mergeReason: 'Waiting for 1 more approval',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      total: 1,
      page: 1,
      limit: 10
    });
  }),

  http.get('*/api/pull-requests/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Implement Phase 5C Review Console',
      url: 'https://github.com/org/repo/pull/1',
      status: 'open',
      requiredApprovals: 2,
      currentApprovals: 1,
      reviewers: [
        { id: 'rev-1', userId: 'user-2', user: { id: 'user-2', name: 'Alice', email: 'alice@a.com' }, status: 'approved', assignedAt: new Date().toISOString() },
        { id: 'rev-2', userId: 'user-3', user: { id: 'user-3', name: 'Bob', email: 'bob@a.com' }, status: 'pending', assignedAt: new Date().toISOString() }
      ],
      version: { id: 'v1', versionNumber: 1, createdAt: new Date().toISOString(), creatorId: 'user-1', creator: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' } },
      sharingStatus: 'not_shared',
      mergeable: false,
      mergeReason: 'Waiting for 1 more approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }),
  
  http.get('*/api/pull-requests/:id/versions', () => {
    return HttpResponse.json([
      { id: 'v1', versionNumber: 1, createdAt: new Date().toISOString(), creatorId: 'user-1', creator: { id: 'user-1', name: 'Admin User' } }
    ]);
  }),

  http.post('*/api/pull-requests/:id/reviewers', async ({ request, params }) => {
    const { userId } = await request.json() as any;
    return HttpResponse.json({
      id: params.id,
      title: 'Implement Phase 5C Review Console',
      status: 'open',
      requiredApprovals: 2,
      currentApprovals: 1,
      reviewers: [
        { id: 'rev-3', userId, user: { id: userId, name: 'New Reviewer', email: 'new@a.com' }, status: 'pending', assignedAt: new Date().toISOString() }
      ],
      version: { id: 'v1', versionNumber: 1, createdAt: new Date().toISOString(), creatorId: 'user-1', creator: { id: 'user-1', name: 'Admin User' } },
      sharingStatus: 'not_shared',
      mergeable: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }),

  // Shared Resources
  http.get('*/api/shared-resources', () => {
    return HttpResponse.json({
      data: [
        { id: 'share-1', resourceId: 'PR-1', resourceType: 'pull_request', ownerOrganizationId: 'org-1', targetOrganizationId: 'org-2', permissions: 'read', createdAt: new Date().toISOString() }
      ],
      total: 1,
      page: 1,
      limit: 10
    });
  }),

  // Digests
  http.get('*/api/digests', () => {
    return HttpResponse.json({
      data: [
        { id: 'digest-1', organizationId: 'org-1', title: 'Weekly Summary', content: 'You merged 5 PRs this week.', createdAt: new Date().toISOString() }
      ],
      total: 1,
      page: 1,
      limit: 10
    });
  })
];
