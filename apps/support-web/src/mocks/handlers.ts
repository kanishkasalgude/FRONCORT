import { http, HttpResponse } from 'msw';

export const handlers = [
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
  http.get('*/api/tickets', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'TKT-1',
          title: 'Cannot access dashboard',
          description: 'I am getting a 403 when accessing the dashboard.',
          status: 'open',
          priority: 'high',
          creatorId: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'TKT-2',
          title: 'Feature request: Dark mode',
          description: 'Please add dark mode.',
          status: 'in_progress',
          priority: 'medium',
          creatorId: 'user-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      total: 2,
      page: 1,
      limit: 10
    });
  }),
  
  http.get('*/api/tickets/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Cannot access dashboard',
      description: 'I am getting a 403 when accessing the dashboard.',
      status: 'open',
      priority: 'high',
      creatorId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }),

  http.get('*/api/tickets/:id/comments', () => {
    return HttpResponse.json([
      { id: 'C-1', ticketId: 'TKT-1', authorId: 'admin', content: 'Looking into this now.', createdAt: new Date().toISOString() }
    ]);
  }),

  http.get('*/api/tickets/:id/attachments', () => {
    return HttpResponse.json([]);
  }),

  http.get('*/api/feature-flags', () => {
    return HttpResponse.json([
      { id: 'FF-1', name: 'new_dashboard', description: 'Enable the new dashboard layout', isEnabled: true, createdAt: new Date().toISOString() },
      { id: 'FF-2', name: 'beta_features', description: 'Enable beta features', isEnabled: false, createdAt: new Date().toISOString() }
    ]);
  }),

  http.post('*/api/tickets', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      id: `TKT-${Math.floor(Math.random() * 1000)}`,
      ...data,
      creatorId: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }),

  http.post('*/api/feature-flags', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({
      id: `FF-${Math.floor(Math.random() * 1000)}`,
      ...data,
      createdAt: new Date().toISOString()
    });
  }),
  
  http.post('*/api/feature-flags/:id/toggle', async ({ request, params }) => {
    const { isEnabled } = await request.json() as any;
    return HttpResponse.json({
      id: params.id,
      name: 'Toggleable feature',
      description: 'Toggleable description',
      isEnabled,
      createdAt: new Date().toISOString()
    });
  })
];
