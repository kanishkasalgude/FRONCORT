import { apiClient } from './client';
import type { Organization } from '@workspace/shared-types';

export const organizationsApi = {
  getOrganizations: () => apiClient.get<any>('/api/auth/me').then(res => res.organizations as Organization[]),
  switchOrganization: (orgId: string) => apiClient.patch<void>(`/api/auth/switch-org`, { orgId }),
};
