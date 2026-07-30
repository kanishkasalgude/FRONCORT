import { Request, Response, NextFunction } from 'express';
import { ReviewerService } from '../services/reviewer.service';
import { sendSuccess, sendError } from '../../../utils/response';

export class ReviewerController {
  static async assignReviewer(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewer = await ReviewerService.assignReviewer(req.params.id, req.user!.activeOrgId, req.user!.userId, req.body.userId);
      return sendSuccess(res, reviewer, 201);
    } catch (error: any) {
      if (error.message === 'Pull Request not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      if (error.name === 'ConflictError') return sendError(res, 'CONFLICT', error.message, 409);
      next(error);
    }
  }

  static async removeReviewer(req: Request, res: Response, next: NextFunction) {
    try {
      await ReviewerService.removeReviewer(req.params.id, req.user!.activeOrgId, req.user!.userId, req.params.reviewerId);
      return sendSuccess(res, { removed: true });
    } catch (error: any) {
      if (error.message === 'Pull Request not found' || error.message === 'Reviewer not found') {
        return sendError(res, 'NOT_FOUND', error.message, 404);
      }
      next(error);
    }
  }

  static async getReviewers(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewers = await ReviewerService.getReviewers(req.params.id, req.user!.activeOrgId);
      return sendSuccess(res, reviewers);
    } catch (error: any) {
      if (error.message === 'Pull Request not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }
}
