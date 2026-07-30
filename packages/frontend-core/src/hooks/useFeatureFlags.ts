import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureFlagsApi } from '@workspace/api-client';
import type { FeatureFlag } from '@workspace/shared-types';

export const useFeatureFlags = () => {
  return useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => featureFlagsApi.getFeatureFlags(),
  });
};

export const useCreateFeatureFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FeatureFlag>) => featureFlagsApi.createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
};

export const useUpdateFeatureFlag = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FeatureFlag>) => featureFlagsApi.updateFeatureFlag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
};

export const useDeleteFeatureFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => featureFlagsApi.deleteFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
};

export const useToggleFeatureFlag = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isEnabled: boolean) => featureFlagsApi.toggleFeatureFlag(id, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });
};
