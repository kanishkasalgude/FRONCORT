import { apiClient } from './client';
import type { Organization } from '@workspace/shared-types';

export const organizationsApi = {
  getOrganizations: () => apiClient.get<Organization[]>('/api/organizations'),
  switchOrganization: (orgId: string) => apiClient.post<void>(`/api/organizations/${orgId}/switch`),
};
