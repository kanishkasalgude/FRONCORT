import { useQuery } from '@tanstack/react-query';
import { attachmentsApi } from '@workspace/api-client';

export const useTicketAttachments = (ticketId: string) => {
  return useQuery({
    queryKey: ['attachments', ticketId],
    queryFn: () => attachmentsApi.getTicketAttachments(ticketId),
    enabled: !!ticketId,
  });
};
