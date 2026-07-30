import { useQuery } from '@tanstack/react-query';
import { digestsApi } from '@workspace/api-client';
import type { GetDigestsParams } from '@workspace/api-client';
import { queryKeys } from './queryKeys';

export function useDigests(params?: GetDigestsParams) {
  return useQuery({
    queryKey: queryKeys.digests.list(params),
    queryFn: () => digestsApi.getDigests(params),
  });
}
