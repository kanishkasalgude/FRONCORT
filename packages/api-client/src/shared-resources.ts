import { apiClient } from './client';
import type { ResourceShare } from '@workspace/shared-types';

export interface GetSharedResourcesParams {
  page?: number;
  limit?: number;
  type?: 'received' | 'sent';
}

export interface PaginatedSharedResources {
  data: ResourceShare[];
  total: number;
  page: number;
  limit: number;
}

export const sharedResourcesApi = {
  getSharedResources: (params?: GetSharedResourcesParams) => 
    apiClient.get<PaginatedSharedResources>('/api/shared-resources', { params: params as any }),
    
  shareResource: (data: { resourceId: string; resourceType: 'ticket' | 'pull_request'; targetOrganizationId: string; permissions: 'read' | 'write' | 'admin' }) => 
    apiClient.post<ResourceShare>('/api/shared-resources', data),
    
  revokeShare: (shareId: string) => 
    apiClient.post<ResourceShare>(`/api/shared-resources/${shareId}/revoke`),
};
