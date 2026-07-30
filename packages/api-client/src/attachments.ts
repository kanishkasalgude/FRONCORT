import { apiClient } from './client';
import type { Attachment } from '@workspace/shared-types';

export const attachmentsApi = {
  getTicketAttachments: (ticketId: string) => 
    apiClient.get<Attachment[]>(`/api/tickets/${ticketId}/attachments`),
};
