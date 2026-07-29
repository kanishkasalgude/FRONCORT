import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../modules/identity/services/session.service';
import { sendError } from '../utils/response';

export const requireSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.sessionId) {
      return sendError(res, 'UNAUTHORIZED', 'Invalid or missing session', 401);
    }

    const isValid = await SessionService.validateSession(req.user.sessionId);
    if (!isValid) {
      return sendError(res, 'UNAUTHORIZED', 'Session expired or revoked', 401);
    }

    // Update last used time in background
    SessionService.updateLastUsed(req.user.sessionId, req.ip, req.get('user-agent')).catch(console.error);

    next();
  } catch (error) {
    next(error);
  }
};
