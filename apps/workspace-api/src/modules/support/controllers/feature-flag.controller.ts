import { Request, Response, NextFunction } from 'express';
import { FeatureFlagService } from '../services/feature-flag.service';
import { sendSuccess, sendError } from '../../../utils/response';

export class FeatureFlagController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const flag = await FeatureFlagService.createFlag(req.user!.activeOrgId, req.body);
      return sendSuccess(res, flag, 201);
    } catch (error: any) {
      if (error.message === 'Feature flag already exists') return sendError(res, 'CONFLICT', error.message, 409);
      next(error);
    }
  }

  static async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const flags = await FeatureFlagService.getFlags(req.user!.activeOrgId);
      return sendSuccess(res, flags);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const flag = await FeatureFlagService.updateFlag(req.params.id, req.user!.activeOrgId, req.body);
      return sendSuccess(res, flag);
    } catch (error: any) {
      if (error.message === 'Feature flag not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await FeatureFlagService.deleteFlag(req.params.id, req.user!.activeOrgId);
      return sendSuccess(res, { deleted: true });
    } catch (error: any) {
      if (error.message === 'Feature flag not found') return sendError(res, 'NOT_FOUND', error.message, 404);
      next(error);
    }
  }
}
