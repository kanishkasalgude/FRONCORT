import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { sendSuccess, sendError } from '../../../utils/response';

export class ReviewController {
  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewer = await ReviewService.approve(req.params.id, req.user!.activeOrgId, req.user!.userId);
      return sendSuccess(res, reviewer);
    } catch (error: any) {
      if (error.message === 'Pull Request not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      if (error.name === 'ConflictError') return sendError(res, 'CONFLICT', error.message, 409);
      if (error.name === 'ForbiddenError') return sendError(res, 'FORBIDDEN', error.message, 403);
      next(error);
    }
  }

  static async requestChanges(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewer = await ReviewService.requestChanges(req.params.id, req.user!.activeOrgId, req.user!.userId);
      return sendSuccess(res, reviewer);
    } catch (error: any) {
      if (error.message === 'Pull Request not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      if (error.name === 'ConflictError') return sendError(res, 'CONFLICT', error.message, 409);
      if (error.name === 'ForbiddenError') return sendError(res, 'FORBIDDEN', error.message, 403);
      next(error);
    }
  }

  static async merge(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await ReviewService.merge(req.params.id, req.user!.activeOrgId, req.user!.userId);
      return sendSuccess(res, pr);
    } catch (error: any) {
      if (error.message === 'Pull Request not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      if (error.name === 'ConflictError') return sendError(res, 'CONFLICT', error.message, 409);
      next(error);
    }
  }
}
