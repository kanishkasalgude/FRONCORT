import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveActiveOrg } from '../resolveActiveOrg';
import { Role } from '@workspace/database';
import { Request, Response, NextFunction } from 'express';
import { MembershipRepository } from '../../modules/identity/repositories/membership.repository';

vi.mock('../../modules/identity/repositories/membership.repository');
vi.mock('../../utils/response', () => ({
  sendError: vi.fn((res, code, msg, status) => {
    res.status(status).json({ code, msg });
  })
}));

describe('Tenant Middleware (resolveActiveOrg)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block users with missing activeOrgId context', async () => {
    const req = { user: { userId: '1' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await resolveActiveOrg(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should block users who are no longer in the organization', async () => {
    const req = { user: { userId: '1', activeOrgId: 'org-1' } } as unknown as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    vi.mocked(MembershipRepository.findByUserIdAndOrgId).mockResolvedValue(null);

    await resolveActiveOrg(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should correctly resolve organization and update role', async () => {
    const req = { user: { userId: '1', activeOrgId: 'org-1', role: 'UNKNOWN' } } as unknown as Request;
    const res = {} as unknown as Response;
    const next = vi.fn() as NextFunction;

    vi.mocked(MembershipRepository.findByUserIdAndOrgId).mockResolvedValue({
      id: 'mem-1',
      userId: '1',
      orgId: 'org-1',
      role: Role.ORG_ADMIN,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await resolveActiveOrg(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.role).toBe(Role.ORG_ADMIN);
  });
});
