import { apiClient } from './client';
import type { FeatureFlag } from '@workspace/shared-types';

export const featureFlagsApi = {
  getFeatureFlags: () => 
    apiClient.get<FeatureFlag[]>('/api/support/feature-flags'),
    
  createFeatureFlag: (data: Partial<FeatureFlag>) => 
    apiClient.post<FeatureFlag>('/api/support/feature-flags', data),
    
  updateFeatureFlag: (id: string, data: Partial<FeatureFlag>) => 
    apiClient.patch<FeatureFlag>(`/api/support/feature-flags/${id}`, data),
    
  deleteFeatureFlag: (id: string) => 
    apiClient.delete<void>(`/api/support/feature-flags/${id}`),
    
  toggleFeatureFlag: (id: string, isEnabled: boolean) => 
    apiClient.post<FeatureFlag>(`/api/support/feature-flags/${id}/toggle`, { isEnabled }),
};
