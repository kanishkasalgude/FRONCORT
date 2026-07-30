import { Request, Response, NextFunction } from 'express';
import { PullRequestService } from '../services/pull-request.service';
import { sendSuccess, sendError } from '../../../utils/response';

export class PullRequestController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await PullRequestService.create(req.user!.activeOrgId, req.user!.userId);
      return sendSuccess(res, pr, 201);
    } catch (error: any) {
      next(error);
    }
  }

  static async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const prs = await PullRequestService.getMany(req.user!.activeOrgId);
      return sendSuccess(res, prs);
    } catch (error: any) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await PullRequestService.getOne(req.params.id, req.user!.activeOrgId);
      return sendSuccess(res, pr);
    } catch (error: any) {
      if (error.message === 'Pull Request not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await PullRequestService.update(req.params.id, req.user!.activeOrgId, req.user!.userId, req.body);
      return sendSuccess(res, pr);
    } catch (error: any) {
      if (error.message === 'Pull Request not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      if (error.message.startsWith('Forbidden')) return sendError(res, 'FORBIDDEN', error.message, 403);
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await PullRequestService.delete(req.params.id, req.user!.activeOrgId, req.user!.userId);
      return sendSuccess(res, { deleted: true });
    } catch (error: any) {
      if (error.message === 'Pull Request not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      if (error.message.startsWith('Forbidden')) return sendError(res, 'FORBIDDEN', error.message, 403);
      next(error);
    }
  }
}
