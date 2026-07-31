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
    apiClient.get<ResourceShare[]>('/api/sharing/shared-with-me', { params: params as any }),
    
  shareResource: (data: { resourceId: string; resourceType: 'ticket' | 'pull_request'; targetOrganizationId: string; permissions: 'read' | 'write' | 'admin' }) => 
    apiClient.post<ResourceShare>('/api/sharing/resources/' + data.resourceId + '/share', data),
    
  revokeShare: (data: { resourceId: string, shareId: string }) => 
    apiClient.delete<ResourceShare>(`/api/sharing/resources/${data.resourceId}/share/${data.shareId}`),
};
