import { describe, it, expect, vi } from 'vitest';
import { authorize } from '../authorize';
import { Role } from '@workspace/database';
import { Request, Response, NextFunction } from 'express';

vi.mock('../../utils/response', () => ({
  sendError: vi.fn((res, code, msg, status) => {
    res.status(status).json({ code, msg });
  })
}));

describe('RBAC Middleware', () => {
  it('should block users without the required role', () => {
    const req = { user: { role: Role.REVIEWER } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    const middleware = authorize([Role.ORG_ADMIN]);
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should allow users with the required role', () => {
    const req = { user: { role: Role.ORG_ADMIN } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = vi.fn() as NextFunction;

    const middleware = authorize([Role.ORG_ADMIN]);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
