import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../modules/identity/services/jwt.service';
import { sendError } from '../utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'UNAUTHORIZED', 'Missing authorization token', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = JwtService.verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      sessionId: payload.sessionId,
      activeOrgId: payload.activeOrgId,
      role: payload.role,
    };

    next();
  } catch (error) {
    return sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
  }
};
