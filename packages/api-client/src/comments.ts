import { apiClient } from './client';
import type { Comment } from '@workspace/shared-types';

export const commentsApi = {
  getComments: (ticketId: string) => 
    apiClient.get<Comment[]>(`/api/support/tickets/${ticketId}/comments`),
    
  createComment: (ticketId: string, content: string) => 
    apiClient.post<Comment>(`/api/support/tickets/${ticketId}/comments`, { content }),
    
  deleteComment: (ticketId: string, commentId: string) => 
    apiClient.delete<void>(`/api/support/tickets/${ticketId}/comments/${commentId}`),
};
