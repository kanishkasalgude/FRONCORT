import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]:', err);

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'UNAUTHORIZED', 'Invalid or expired token', 401);
  }

  return sendError(res, 'INTERNAL_SERVER_ERROR', err.message || 'An unexpected error occurred', 500);
};
