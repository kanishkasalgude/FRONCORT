import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pullRequestsApi } from '@workspace/api-client';
import type { GetPullRequestsParams } from '@workspace/api-client';
import { queryKeys } from './queryKeys';
import { toast } from '@workspace/ui';

export function usePullRequests(params?: GetPullRequestsParams) {
  return useQuery({
    queryKey: queryKeys.pullRequests.list(params),
    queryFn: () => pullRequestsApi.getPullRequests(params),
  });
}

export function usePullRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.pullRequests.detail(id),
    queryFn: () => pullRequestsApi.getPullRequest(id),
    enabled: !!id,
  });
}

export function useCreatePullRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: pullRequestsApi.createPullRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.all });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error creating pull request",
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    }
  });
}

export function useAssignReviewer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prId, userId }: { prId: string; userId: string }) => 
      pullRequestsApi.assignReviewer(prId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.detail(variables.prId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.list(undefined) });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error assigning reviewer",
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    }
  });
}

export function useRemoveReviewer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prId, reviewerId }: { prId: string; reviewerId: string }) => 
      pullRequestsApi.removeReviewer(prId, reviewerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.detail(variables.prId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.list(undefined) });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error removing reviewer",
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    }
  });
}

export function useApprovePullRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prId: string) => pullRequestsApi.approvePullRequest(prId),
    onSuccess: (_, prId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.detail(prId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.list(undefined) });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error approving pull request",
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    }
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prId, reason }: { prId: string; reason?: string }) => 
      pullRequestsApi.requestChanges(prId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.detail(variables.prId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.list(undefined) });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error requesting changes",
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    }
  });
}

export function useMergePullRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prId: string) => pullRequestsApi.mergePullRequest(prId),
    onSuccess: (_, prId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.detail(prId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.pullRequests.list(undefined) });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error merging pull request",
        description: error?.response?.data?.message || error.message || "An unexpected error occurred",
      });
    }
  });
}

export function useVersionHistory(prId: string) {
  return useQuery({
    queryKey: queryKeys.pullRequests.versions(prId),
    queryFn: () => pullRequestsApi.getVersionHistory(prId),
    enabled: !!prId,
  });
}
