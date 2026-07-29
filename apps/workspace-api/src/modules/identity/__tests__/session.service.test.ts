import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionService } from '../services/session.service';
import { SessionRepository } from '../repositories/session.repository';
import { MembershipRepository } from '../repositories/membership.repository';
import { JwtService } from '../services/jwt.service';
import { Role } from '@workspace/database';

vi.mock('../repositories/session.repository');
vi.mock('../repositories/membership.repository');
vi.mock('../services/jwt.service');
vi.mock('../../../utils/env', () => ({
  env: {
    JWT_SECRET: 'test',
    JWT_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d'
  }
}));

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate an active session', async () => {
    vi.mocked(SessionRepository.findById).mockResolvedValue({
      id: 'sess-1',
      userId: 'user-1',
      refreshTokenHash: 'hash',
      expiresAt: new Date(Date.now() + 10000),
      ipAddress: null,
      userAgent: null,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const isValid = await SessionService.validateSession('sess-1');
    expect(isValid).toBe(true);
  });

  it('should reject a revoked session', async () => {
    vi.mocked(SessionRepository.findById).mockResolvedValue({
      id: 'sess-1',
      userId: 'user-1',
      refreshTokenHash: 'hash',
      expiresAt: new Date(Date.now() + 10000),
      ipAddress: null,
      userAgent: null,
      revokedAt: new Date(), // Revoked
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const isValid = await SessionService.validateSession('sess-1');
    expect(isValid).toBe(false);
  });

  it('should refresh a valid token and rotate session', async () => {
    const mockSession = {
      id: 'sess-1',
      userId: 'user-1',
      refreshTokenHash: 'hash1',
      expiresAt: new Date(Date.now() + 10000),
      ipAddress: null,
      userAgent: null,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMembership = {
      id: 'mem-1',
      userId: 'user-1',
      orgId: 'org-1',
      role: Role.ORG_ADMIN,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newSession = {
      ...mockSession,
      id: 'sess-2',
      refreshTokenHash: 'hash2',
    };

    vi.mocked(JwtService.hashRefreshToken).mockReturnValue('hash1');
    vi.mocked(SessionRepository.findByRefreshTokenHash).mockResolvedValue(mockSession);
    vi.mocked(MembershipRepository.findFirstByUserId).mockResolvedValue(mockMembership);
    vi.mocked(JwtService.generateRefreshToken).mockReturnValue('new-refresh');
    vi.mocked(SessionRepository.create).mockResolvedValue(newSession);
    vi.mocked(JwtService.generateAccessToken).mockReturnValue('new-access');

    const result = await SessionService.refresh('old-refresh');

    expect(SessionRepository.revoke).toHaveBeenCalledWith('sess-1');
    expect(result.accessToken).toBe('new-access');
    expect(result.refreshToken).toBe('new-refresh');
  });
});
