import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharedResourcesApi } from '@workspace/api-client';
import type { GetSharedResourcesParams } from '@workspace/api-client';
import { queryKeys } from './queryKeys';
import { toast } from '@workspace/ui';

export function useSharedResources(params?: GetSharedResourcesParams) {
  return useQuery({
    queryKey: queryKeys.sharedResources.list(params),
    queryFn: () => sharedResourcesApi.getSharedResources(params),
  });
}

export function useShareResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sharedResourcesApi.shareResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sharedResources.all });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error sharing resource",
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    }
  });
}

export function useRevokeShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sharedResourcesApi.revokeShare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sharedResources.all });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error revoking share",
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    }
  });
}
