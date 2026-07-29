import { CommentRepository } from '../repositories/comment.repository';
import { CreateCommentInput } from '@workspace/shared/validation/support';

export class CommentService {
  static async addComment(ticketId: string, orgId: string, authorId: string, data: CreateCommentInput) {
    const comment = await CommentRepository.create(orgId, {
      ticketId,
      authorId,
      body: data.body,
    });
    if (!comment) throw new Error('Ticket not found');
    return comment;
  }

  static async getComments(ticketId: string, orgId: string) {
    const comments = await CommentRepository.findByTicketId(ticketId, orgId);
    if (!comments) throw new Error('Ticket not found');
    return comments;
  }

  static async deleteComment(id: string, orgId: string) {
    const success = await CommentRepository.delete(id, orgId);
    if (!success) throw new Error('Comment not found');
    return true;
  }
}
