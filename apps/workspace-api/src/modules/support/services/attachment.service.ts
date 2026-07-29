import { AttachmentRepository } from '../repositories/attachment.repository';
import { CreateAttachmentInput } from '@workspace/shared/validation/support';

export class AttachmentService {
  static async addAttachment(ticketId: string, orgId: string, data: CreateAttachmentInput) {
    const attachment = await AttachmentRepository.create(orgId, {
      ticketId,
      url: data.url,
    });
    if (!attachment) throw new Error('Ticket not found');
    return attachment;
  }

  static async getAttachments(ticketId: string, orgId: string) {
    const attachments = await AttachmentRepository.findByTicketId(ticketId, orgId);
    if (!attachments) throw new Error('Ticket not found');
    return attachments;
  }
}
