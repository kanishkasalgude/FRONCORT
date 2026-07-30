import { Request, Response } from 'express';
import { ResourceShareService } from '../services/resource-share.service';

export class ResourceShareController {
  static async shareResource(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const { targetOrgId } = req.body;
      const activeOrgId = req.user!.activeOrgId;
      const userId = req.user!.userId;

      const share = await ResourceShareService.shareResource(activeOrgId, userId, resourceId, targetOrgId);
      res.status(201).json({ data: share });
    } catch (error: any) {
      if (error.name === 'ConflictError') {
        res.status(409).json({ error: error.message });
      } else if (error.name === 'ForbiddenError') {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  static async revokeShare(req: Request, res: Response) {
    try {
      const { resourceId, shareId } = req.params;
      const activeOrgId = req.user!.activeOrgId;
      const userId = req.user!.userId;

      await ResourceShareService.revokeShare(activeOrgId, userId, resourceId, shareId);
      res.status(200).json({ message: 'Share revoked successfully' });
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else if (error.name === 'ForbiddenError') {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  static async listShares(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const activeOrgId = req.user!.activeOrgId;

      const shares = await ResourceShareService.listShares(activeOrgId, resourceId);
      res.status(200).json({ data: shares });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getSharedWithMe(req: Request, res: Response) {
    try {
      const activeOrgId = req.user!.activeOrgId;
      const shares = await ResourceShareService.getSharedWithMe(activeOrgId);
      res.status(200).json({ data: shares });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSharedResourceDetails(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const activeOrgId = req.user!.activeOrgId;

      const details = await ResourceShareService.getSharedResourceDetails(activeOrgId, resourceId);
      res.status(200).json({ data: details });
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
