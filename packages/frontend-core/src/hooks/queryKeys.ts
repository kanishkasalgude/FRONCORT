export const queryKeys = {
  // Auth & Org
  auth: {
    me: ['auth', 'me'] as const,
  },
  organization: {
    all: ['organization'] as const,
  },
  // Support Hub
  tickets: {
    all: ['tickets'] as const,
    list: (params: any) => ['tickets', 'list', params] as const,
    detail: (id: string) => ['tickets', 'detail', id] as const,
    comments: (id: string) => ['tickets', 'comments', id] as const,
    attachments: (id: string) => ['tickets', 'attachments', id] as const,
  },
  featureFlags: {
    all: ['feature-flags'] as const,
  },
  // Review Console
  pullRequests: {
    all: ['pull-requests'] as const,
    list: (params: any) => ['pull-requests', 'list', params] as const,
    detail: (id: string) => ['pull-requests', 'detail', id] as const,
    versions: (id: string) => ['pull-requests', 'versions', id] as const,
  },
  sharedResources: {
    all: ['shared-resources'] as const,
    list: (params: any) => ['shared-resources', 'list', params] as const,
  },
  digests: {
    all: ['digests'] as const,
    list: (params: any) => ['digests', 'list', params] as const,
  },
};
