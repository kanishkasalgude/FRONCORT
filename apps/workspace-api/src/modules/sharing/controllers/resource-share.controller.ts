import { Request, Response } from 'express';
import { ResourceShareService } from '../services/resource-share.service';
import { sendSuccess, sendError } from '../../../utils/response';

export class ResourceShareController {
  static async shareResource(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const { targetOrgId } = req.body;
      const activeOrgId = req.user!.activeOrgId;
      const userId = req.user!.userId;

      const share = await ResourceShareService.shareResource(activeOrgId, userId, resourceId, targetOrgId);
      return sendSuccess(res, share, 201);
    } catch (error: any) {
      if (error.name === 'ConflictError') {
        return sendError(res, 'CONFLICT', error.message, 409);
      } else if (error.name === 'ForbiddenError') {
        return sendError(res, 'FORBIDDEN', error.message, 403);
      } else {
        return sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
      }
    }
  }

  static async revokeShare(req: Request, res: Response) {
    try {
      const { resourceId, shareId } = req.params;
      const activeOrgId = req.user!.activeOrgId;
      const userId = req.user!.userId;

      await ResourceShareService.revokeShare(activeOrgId, userId, resourceId, shareId);
      return sendSuccess(res, { message: 'Share revoked successfully' });
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return sendError(res, 'NOT_FOUND', error.message, 404);
      } else if (error.name === 'ForbiddenError') {
        return sendError(res, 'FORBIDDEN', error.message, 403);
      } else {
        return sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
      }
    }
  }

  static async listShares(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const activeOrgId = req.user!.activeOrgId;

      const shares = await ResourceShareService.listShares(activeOrgId, resourceId);
      return sendSuccess(res, shares);
    } catch (error: any) {
      return sendError(res, 'BAD_REQUEST', error.message, 400);
    }
  }

  static async getSharedWithMe(req: Request, res: Response) {
    try {
      const activeOrgId = req.user!.activeOrgId;
      const shares = await ResourceShareService.getSharedWithMe(activeOrgId);
      return sendSuccess(res, shares);
    } catch (error: any) {
      return sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
    }
  }

  static async getSharedResourceDetails(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const activeOrgId = req.user!.activeOrgId;

      const details = await ResourceShareService.getSharedResourceDetails(activeOrgId, resourceId);
      return sendSuccess(res, details);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return sendError(res, 'NOT_FOUND', error.message, 404);
      } else {
        return sendError(res, 'INTERNAL_SERVER_ERROR', error.message, 500);
      }
    }
  }
}
