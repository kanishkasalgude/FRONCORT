import { apiClient } from './client';
import type { Digest } from '@workspace/shared-types';

export interface GetDigestsParams {
  page?: number;
  limit?: number;
}

export interface PaginatedDigests {
  data: Digest[];
  total: number;
  page: number;
  limit: number;
}

export const digestsApi = {
  getDigests: (params?: GetDigestsParams) => 
    apiClient.get<PaginatedDigests>('/api/digests', { params: params as any }),
};
