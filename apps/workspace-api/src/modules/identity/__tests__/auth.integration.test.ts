import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { prisma, Role } from '@workspace/database';
import bcrypt from 'bcrypt';
import { JwtService } from '../services/jwt.service';

vi.mock('@workspace/database', () => ({
  prisma: {
    $transaction: vi.fn(),
    user: { findUnique: vi.fn() },
    org: { findUnique: vi.fn(), findMany: vi.fn() },
    orgMembership: { findUnique: vi.fn(), findFirst: vi.fn() },
    session: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn() },
    auditLog: { create: vi.fn(), findMany: vi.fn() },
    $queryRaw: vi.fn()
  },
  Role: { ORG_ADMIN: 'ORG_ADMIN', REVIEWER: 'REVIEWER', SUPPORT_AGENT: 'SUPPORT_AGENT' }
}));
vi.mock('../repositories/auth-transaction.repository');
vi.mock('bcrypt');

vi.mock('../../../utils/env', () => ({
  env: { JWT_SECRET: 'integration-secret', JWT_EXPIRES_IN: '15m', JWT_REFRESH_EXPIRES_IN: '7d' }
}));

describe('Identity Integration (HTTP Layer)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /ready returns 200 when DB is up', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([1] as never);
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('POST /api/auth/register handles valid request', async () => {
    // We mock the AuthService response indirectly by mocking the repos it calls
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hash' as never);

    const { AuthTransactionRepository } = await import('../repositories/auth-transaction.repository');
    vi.mocked(AuthTransactionRepository.registerWithDefaults).mockResolvedValue({
      user: { id: 'u1', email: 'test@example.com' } as any,
      org: { id: 'o1', name: 'Org' } as any,
      session: { id: 's1' } as any
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      orgName: 'My Org'
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.headers['set-cookie'][0]).toContain('refreshToken=');
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(res.headers['set-cookie'][0]).toContain('SameSite=Lax');
  });

  it('POST /api/auth/login sets cookies and returns tokens', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', email: 'test@example.com', passwordHash: 'hash' } as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(prisma.orgMembership.findFirst).mockResolvedValue({ orgId: 'o1', role: Role.ORG_ADMIN } as any);
    vi.mocked(prisma.session.create).mockResolvedValue({ id: 's1' } as any);

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.headers['set-cookie'][0]).toContain('refreshToken=');
  });

  it('GET /api/auth/me rejects requests without active session', async () => {
    // Generate valid JWT but mock session DB lookup to fail
    const token = JwtService.generateAccessToken({ userId: 'u1', sessionId: 's1', activeOrgId: 'o1', role: Role.ORG_ADMIN });
    
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ revokedAt: new Date() } as any); // Revoked

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error.message).toContain('Session expired or revoked');
  });

  it('POST /api/auth/logout clears refresh cookie', async () => {
    const token = JwtService.generateAccessToken({ userId: 'u1', sessionId: 's1', activeOrgId: 'o1', role: Role.ORG_ADMIN });
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ expiresAt: new Date(Date.now() + 10000), revokedAt: null } as any);
    vi.mocked(prisma.orgMembership.findUnique).mockResolvedValue({ role: Role.ORG_ADMIN } as any);

    const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toContain('refreshToken=;');
  });
});
