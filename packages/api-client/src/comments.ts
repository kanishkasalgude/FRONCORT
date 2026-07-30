import { apiClient } from './client';
import type { Comment } from '@workspace/shared-types';

export const commentsApi = {
  getComments: (ticketId: string) => 
    apiClient.get<Comment[]>(`/api/tickets/${ticketId}/comments`),
    
  createComment: (ticketId: string, content: string) => 
    apiClient.post<Comment>(`/api/tickets/${ticketId}/comments`, { content }),
    
  deleteComment: (ticketId: string, commentId: string) => 
    apiClient.delete<void>(`/api/tickets/${ticketId}/comments/${commentId}`),
};
