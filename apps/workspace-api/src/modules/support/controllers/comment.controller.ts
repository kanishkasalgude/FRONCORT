import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { sendSuccess, sendError } from '../../../utils/response';

export class CommentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await CommentService.addComment(
        req.params.id,
        req.user!.activeOrgId,
        req.user!.userId,
        req.body
      );
      return sendSuccess(res, comment, 201);
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await CommentService.getComments(req.params.id, req.user!.activeOrgId);
      return sendSuccess(res, comments);
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CommentService.deleteComment(req.params.commentId, req.user!.activeOrgId, req.user!.userId);
      return sendSuccess(res, { deleted: true });
    } catch (error: any) {
      if (error.message === 'Comment not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }
}
