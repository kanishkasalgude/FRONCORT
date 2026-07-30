import { apiClient } from './client';
import type { Ticket } from '@workspace/shared-types';

export interface GetTicketsParams {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const ticketsApi = {
  getTickets: (params?: GetTicketsParams) => 
    apiClient.get<PaginatedResponse<Ticket>>('/api/tickets', { params: params as Record<string, string> }),
  
  getTicket: (id: string) => 
    apiClient.get<Ticket>(`/api/tickets/${id}`),
    
  createTicket: (data: Partial<Ticket>) => 
    apiClient.post<Ticket>('/api/tickets', data),
    
  updateTicket: (id: string, data: Partial<Ticket>) => 
    apiClient.patch<Ticket>(`/api/tickets/${id}`, data),
    
  deleteTicket: (id: string) => 
    apiClient.delete<void>(`/api/tickets/${id}`),
};
