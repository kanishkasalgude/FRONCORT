import { useQuery } from '@tanstack/react-query';
import { organizationsApi } from '@workspace/api-client';
import { queryKeys } from './queryKeys';

export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.organization.all,
    queryFn: organizationsApi.getOrganizations,
  });
}
