import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { prisma, Role } from '@workspace/database';
import { JwtService } from '../../identity/services/jwt.service';

vi.mock('@workspace/database', () => ({
  prisma: {
    ticket: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    ticketComment: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    ticketAttachment: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    featureFlag: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    session: { findUnique: vi.fn(), update: vi.fn() },
    orgMembership: { findFirst: vi.fn(), findUnique: vi.fn() },
    auditLog: { create: vi.fn(), findMany: vi.fn() }
  },
  Role: { ORG_ADMIN: 'ORG_ADMIN', REVIEWER: 'REVIEWER', SUPPORT_AGENT: 'SUPPORT_AGENT' }
}));

vi.mock('../../../utils/env', () => ({
  env: { JWT_SECRET: 'integration-secret', JWT_EXPIRES_IN: '15m', JWT_REFRESH_EXPIRES_IN: '7d' }
}));

describe('Support Hub Integration', () => {
  const token = JwtService.generateAccessToken({ userId: 'u1', sessionId: 's1', activeOrgId: 'org1', role: Role.SUPPORT_AGENT });
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.session.findUnique).mockResolvedValue({ expiresAt: new Date(Date.now() + 10000), revokedAt: null } as any);
    vi.mocked(prisma.orgMembership.findUnique).mockResolvedValue({ role: Role.SUPPORT_AGENT } as any);
  });

  it('POST /api/support/tickets creates a ticket', async () => {
    vi.mocked(prisma.ticket.create).mockResolvedValue({ id: 't1', title: 'Test Ticket' } as any);
    const res = await request(app)
      .post('/api/support/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Ticket' });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('t1');
  });

  it('GET /api/support/tickets returns tickets for org', async () => {
    vi.mocked(prisma.ticket.findMany).mockResolvedValue([{ id: 't1' }] as any);
    const res = await request(app).get('/api/support/tickets').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
  
  it('GET /api/support/tickets/:id returns 404 for cross-org BOLA', async () => {
    vi.mocked(prisma.ticket.findFirst).mockResolvedValue(null);
    const res = await request(app).get('/api/support/tickets/t2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('POST /api/support/feature-flags blocks non-admins', async () => {
    const res = await request(app)
      .post('/api/support/feature-flags')
      .set('Authorization', `Bearer ${token}`)
      .send({ key: 'TEST', enabled: true });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('Insufficient permissions');
  });
});
