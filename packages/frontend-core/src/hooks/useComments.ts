import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@workspace/api-client';

export const useComments = (ticketId: string) => {
  return useQuery({
    queryKey: ['comments', ticketId],
    queryFn: () => commentsApi.getComments(ticketId),
    enabled: !!ticketId,
  });
};

export const useCreateComment = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => commentsApi.createComment(ticketId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ticketId] });
    },
  });
};

export const useDeleteComment = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(ticketId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ticketId] });
    },
  });
};
