import { Request, Response, NextFunction } from 'express';
import { MembershipRepository } from '../modules/identity/repositories/membership.repository';
import { sendError } from '../utils/response';

export const resolveActiveOrg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.activeOrgId) {
      return sendError(res, 'UNAUTHORIZED', 'No active organization context', 401);
    }

    const membership = await MembershipRepository.findByUserIdAndOrgId(req.user.userId, req.user.activeOrgId);
    
    if (!membership) {
      return sendError(res, 'FORBIDDEN', 'User is no longer a member of the active organization', 403);
    }

    // Ensure the role is up to date with the DB
    req.user.role = membership.role;

    next();
  } catch (error) {
    next(error);
  }
};
