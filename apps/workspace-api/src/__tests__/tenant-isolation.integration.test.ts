import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { execSync } from 'child_process';
import app from '../app';
import { prisma, Role, TicketStatus, PRStatus, ResourceType } from '@workspace/database';
import { JwtService } from '../modules/identity/services/jwt.service';
import crypto from 'crypto';

describe('Tenant Data Isolation Integration', () => {
  let orgA: any;
  let orgB: any;
  let userA: any;
  let userB: any;
  let ticketA: any;
  let ticketB: any;
  let prA: any;
  let prB: any;
  let flagA: any;
  let flagB: any;
  let digestA: any;
  let digestB: any;
  
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    // Push the schema to the test database
    execSync('npx prisma db push --schema ../../packages/database/prisma/schema.prisma --skip-generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    
    await prisma.$connect();
    
    // Clear relevant data
    await prisma.digest.deleteMany();
    await prisma.ticketComment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.pRReviewer.deleteMany();
    await prisma.pullRequest.deleteMany();
    await prisma.featureFlag.deleteMany();
    await prisma.orgMembership.deleteMany();
    await prisma.session.deleteMany();
    await prisma.orgConnection.deleteMany();
    await prisma.org.deleteMany();
    await prisma.user.deleteMany();

    // Create Orgs
    orgA = await prisma.org.create({ data: { name: 'Test Org A' } });
    orgB = await prisma.org.create({ data: { name: 'Test Org B' } });

    // Create Users
    userA = await prisma.user.create({ data: { email: 'user.a@test.com', passwordHash: 'hash' } });
    userB = await prisma.user.create({ data: { email: 'user.b@test.com', passwordHash: 'hash' } });

    // Memberships
    await prisma.orgMembership.create({ data: { userId: userA.id, orgId: orgA.id, role: Role.ORG_ADMIN } });
    await prisma.orgMembership.create({ data: { userId: userB.id, orgId: orgB.id, role: Role.ORG_ADMIN } });

    // Tickets
    ticketA = await prisma.ticket.create({ data: { orgId: orgA.id, title: 'Ticket A', creatorId: userA.id } });
    ticketB = await prisma.ticket.create({ data: { orgId: orgB.id, title: 'Ticket B', creatorId: userB.id } });

    // Pull Requests
    prA = await prisma.pullRequest.create({ data: { orgId: orgA.id, authorId: userA.id, status: PRStatus.IN_REVIEW } });
    prB = await prisma.pullRequest.create({ data: { orgId: orgB.id, authorId: userB.id, status: PRStatus.IN_REVIEW } });

    // Feature Flags
    flagA = await prisma.featureFlag.create({ data: { orgId: orgA.id, key: 'Flag A', enabled: true } });
    flagB = await prisma.featureFlag.create({ data: { orgId: orgB.id, key: 'Flag B', enabled: true } });

    // Digests
    digestA = await prisma.digest.create({ data: { orgId: orgA.id, userId: userA.id, summary: 'Digest A' } });
    digestB = await prisma.digest.create({ data: { orgId: orgB.id, userId: userB.id, summary: 'Digest B' } });

    // Generate Tokens
    tokenA = JwtService.generateAccessToken({ userId: userA.id, sessionId: 's1', activeOrgId: orgA.id, role: Role.ORG_ADMIN });
    tokenB = JwtService.generateAccessToken({ userId: userB.id, sessionId: 's2', activeOrgId: orgB.id, role: Role.ORG_ADMIN });
    
    // Simulate active sessions
    await prisma.session.create({ data: { id: 's1', userId: userA.id, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() + 10000) } });
    await prisma.session.create({ data: { id: 's2', userId: userB.id, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() + 10000) } });
  });

  afterAll(async () => {
    // Cleanup is handled by global setup or vitest resets, but let's disconnect Prisma.
    await prisma.$disconnect();
  });

  describe('Support (Tickets)', () => {
    it('Org A cannot read Org B ticket', async () => {
      const res = await request(app).get(`/api/support/tickets/${ticketB.id}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(404);
    });

    it('Org A cannot update Org B ticket', async () => {
      const res = await request(app).put(`/api/support/tickets/${ticketB.id}`).set('Authorization', `Bearer ${tokenA}`).send({ title: 'Hacked' });
      expect(res.status).toBe(404);
    });

    it('Org A cannot delete Org B ticket', async () => {
      const res = await request(app).delete(`/api/support/tickets/${ticketB.id}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Review (Pull Requests)', () => {
    it('Org A cannot view Org B pull request', async () => {
      const res = await request(app).get(`/api/review/prs/${prB.id}`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(404);
    });

    it('Org A cannot approve Org B pull request', async () => {
      const res = await request(app).post(`/api/review/prs/${prB.id}/approve`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(404);
    });

    it('Org A cannot merge Org B pull request', async () => {
      const res = await request(app).post(`/api/review/prs/${prB.id}/merge`).set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(404);
    });
  });

  describe('Feature Flags', () => {
    it('Org A cannot modify Org B feature flag', async () => {
      const res = await request(app).put(`/api/support/feature-flags/${flagB.id}`).set('Authorization', `Bearer ${tokenA}`).send({ enabled: false });
      expect(res.status).toBe(404); // Assuming BOLA check returns 404
    });
  });


});
