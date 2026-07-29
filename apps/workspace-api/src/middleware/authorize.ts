import { Request, Response, NextFunction } from 'express';
import { Role } from '@workspace/database';
import { sendError } from '../utils/response';

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 'FORBIDDEN', 'Access denied', 403);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'FORBIDDEN', 'Insufficient permissions', 403);
    }

    next();
  };
};
