import { describe, it, expect, vi, beforeAll } from 'vitest';
import { JwtService } from '../services/jwt.service';
import { Role } from '@workspace/database';
import jwt from 'jsonwebtoken';

// Mock env directly in test
vi.mock('../../../utils/env', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '15m'
  }
}));

describe('JwtService', () => {
  const mockPayload = {
    userId: 'user-1',
    sessionId: 'session-1',
    activeOrgId: 'org-1',
    role: Role.ORG_ADMIN,
  };

  it('should generate and verify an access token', () => {
    const token = JwtService.generateAccessToken(mockPayload);
    expect(typeof token).toBe('string');
    
    const decoded = JwtService.verifyAccessToken(token);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.sessionId).toBe(mockPayload.sessionId);
    expect(decoded.activeOrgId).toBe(mockPayload.activeOrgId);
    expect(decoded.role).toBe(mockPayload.role);
  });

  it('should generate a refresh token', () => {
    const refreshToken = JwtService.generateRefreshToken();
    expect(typeof refreshToken).toBe('string');
    expect(refreshToken.length).toBeGreaterThan(20); // hex string
  });

  it('should hash a refresh token deterministically', () => {
    const token = 'my-random-refresh-token';
    const hash1 = JwtService.hashRefreshToken(token);
    const hash2 = JwtService.hashRefreshToken(token);
    
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(token);
  });

  it('should throw when verifying an invalid token', () => {
    expect(() => JwtService.verifyAccessToken('invalid-token')).toThrow(jwt.JsonWebTokenError);
  });
});
