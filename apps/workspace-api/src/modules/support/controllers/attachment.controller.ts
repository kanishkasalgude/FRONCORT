import { Request, Response, NextFunction } from 'express';
import { AttachmentService } from '../services/attachment.service';
import { sendSuccess, sendError } from '../../../utils/response';

export class AttachmentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const attachment = await AttachmentService.addAttachment(
        req.params.id,
        req.user!.activeOrgId,
        req.body
      );
      return sendSuccess(res, attachment, 201);
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const attachments = await AttachmentService.getAttachments(req.params.id, req.user!.activeOrgId);
      return sendSuccess(res, attachments);
    } catch (error: any) {
      if (error.message === 'Ticket not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }
}
