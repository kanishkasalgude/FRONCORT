import { CommentRepository } from '../repositories/comment.repository';
import { CreateCommentInput } from '@workspace/shared/validation/support';
import { AuditService } from '../../audit/services/audit.service';

export class CommentService {
  static async addComment(ticketId: string, orgId: string, authorId: string, data: CreateCommentInput) {
    const comment = await CommentRepository.create(orgId, {
      ticketId,
      authorId,
      body: data.body,
    });
    if (!comment) throw new Error('Ticket not found');

    await AuditService.logAction({
      userId: authorId,
      organizationId: orgId,
      action: 'CREATE_COMMENT',
      resourceType: 'TICKET_COMMENT',
      resourceId: comment.id,
      metadata: { ticketId }
    });

    return comment;
  }

  static async getComments(ticketId: string, orgId: string) {
    const comments = await CommentRepository.findByTicketId(ticketId, orgId);
    if (!comments) throw new Error('Ticket not found');
    return comments;
  }

  static async deleteComment(id: string, orgId: string, actorId: string) {
    const success = await CommentRepository.delete(id, orgId);
    if (!success) throw new Error('Comment not found');

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'DELETE_COMMENT',
      resourceType: 'TICKET_COMMENT',
      resourceId: id,
    });

    return true;
  }
}
