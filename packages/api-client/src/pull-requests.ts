import { apiClient } from './client';
import type { PullRequest, PullRequestVersion } from '@workspace/shared-types';

export interface GetPullRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
  reviewerId?: string;
}

export interface PaginatedPullRequests {
  data: PullRequest[];
  total: number;
  page: number;
  limit: number;
}

export const pullRequestsApi = {
  getPullRequests: (params?: GetPullRequestsParams) => 
    apiClient.get<PaginatedPullRequests>('/api/pull-requests', { params: params as any }),
    
  getPullRequest: (id: string) => 
    apiClient.get<PullRequest>(`/api/pull-requests/${id}`),
    
  createPullRequest: (data: Partial<PullRequest>) => 
    apiClient.post<PullRequest>('/api/pull-requests', data),
    
  assignReviewer: (prId: string, userId: string) => 
    apiClient.post<PullRequest>(`/api/pull-requests/${prId}/reviewers`, { userId }),
    
  removeReviewer: (prId: string, reviewerId: string) => 
    apiClient.delete<PullRequest>(`/api/pull-requests/${prId}/reviewers/${reviewerId}`),
    
  approvePullRequest: (prId: string) => 
    apiClient.post<PullRequest>(`/api/pull-requests/${prId}/approve`),
    
  requestChanges: (prId: string, reason?: string) => 
    apiClient.post<PullRequest>(`/api/pull-requests/${prId}/request-changes`, { reason }),
    
  mergePullRequest: (prId: string) => 
    apiClient.post<PullRequest>(`/api/pull-requests/${prId}/merge`),
    
  getVersionHistory: (prId: string) => 
    apiClient.get<PullRequestVersion[]>(`/api/pull-requests/${prId}/versions`),
};
