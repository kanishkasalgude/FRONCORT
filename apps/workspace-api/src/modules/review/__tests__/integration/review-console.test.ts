import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { execSync } from 'child_process';

import app from '../../../../app';
import { prisma, Role, PRStatus, ApprovalStatus } from '@workspace/database';
import { JwtService } from '../../../identity/services/jwt.service';

describe('Review Console Integration (Real DB)', () => {
  let adminToken: string;
  let reviewerToken: string;
  let adminId: string;
  let reviewerId: string;
  let orgId: string;

  beforeAll(async () => {
    // We assume vitest is running with NODE_ENV=test and using a test DB
    // Push the schema to the test database
    execSync('npx prisma db push --schema ../../packages/database/prisma/schema.prisma --skip-generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });

    // Ensure we are connected to the DB.
    await prisma.$connect();

    // Create required records
    const org = await prisma.org.create({
      data: { name: 'Test Org for Review' }
    });
    orgId = org.id;

    const passwordHash = 'dummy-hash';
    const admin = await prisma.user.create({
      data: { email: `admin_${Date.now()}@test.com`, passwordHash }
    });
    adminId = admin.id;

    const reviewer = await prisma.user.create({
      data: { email: `reviewer_${Date.now()}@test.com`, passwordHash }
    });
    reviewerId = reviewer.id;

    await prisma.orgMembership.create({
      data: { userId: admin.id, orgId: org.id, role: Role.ORG_ADMIN }
    });

    await prisma.orgMembership.create({
      data: { userId: reviewer.id, orgId: org.id, role: Role.REVIEWER }
    });

    const adminSession = await prisma.session.create({
      data: { userId: admin.id, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() + 1000000) }
    });

    const reviewerSession = await prisma.session.create({
      data: { userId: reviewer.id, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() + 1000000) }
    });

    adminToken = JwtService.generateAccessToken({ userId: admin.id, sessionId: adminSession.id, activeOrgId: org.id, role: Role.ORG_ADMIN });
    reviewerToken = JwtService.generateAccessToken({ userId: reviewer.id, sessionId: reviewerSession.id, activeOrgId: org.id, role: Role.REVIEWER });
  });

  afterAll(async () => {
    // Delete seeded records
    await prisma.auditLog.deleteMany();
    await prisma.digest.deleteMany();
    await prisma.resourceShare.deleteMany();
    await prisma.pRReviewer.deleteMany();
    await prisma.pRVersion.deleteMany();
    await prisma.pullRequest.deleteMany();
    await prisma.ticketComment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.featureFlag.deleteMany();
    await prisma.session.deleteMany();
    await prisma.orgMembership.deleteMany();
    await prisma.orgConnection.deleteMany();
    await prisma.org.deleteMany();
    await prisma.user.deleteMany();
    
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up created entities for PRs so each test is repeatable
    await prisma.auditLog.deleteMany();
    await prisma.pRReviewer.deleteMany({ where: { pr: { orgId } } });
    await prisma.pRVersion.deleteMany({ where: { pr: { orgId } } });
    await prisma.pullRequest.deleteMany({ where: { orgId } });
  });

  it('creates PR', async () => {
    const res = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.orgId).toBe(orgId);
  });

  it('updates PR status', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    const res = await request(app).patch(`/api/review/pull-requests/${prId}`).set('Authorization', `Bearer ${adminToken}`).send({ status: PRStatus.IN_REVIEW });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(PRStatus.IN_REVIEW);
  });

  it('assigns reviewer (ORG_ADMIN only)', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    const res = await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(reviewerId);
  });

  it('duplicate reviewer fails', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    
    const res = await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    expect(res.status).toBe(409);
  });

  it('removes reviewer', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    
    const res = await request(app).delete(`/api/review/pull-requests/${prId}/reviewers/${reviewerId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('approves PR', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    
    const res = await request(app).post(`/api/review/pull-requests/${prId}/approve`).set('Authorization', `Bearer ${reviewerToken}`);
    expect(res.status).toBe(200);
  });

  it('creator cannot approve', async () => {
    // Reviewer creates the PR
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${reviewerToken}`).send({});
    const prId = createRes.body.data.id;

    // Admin assigns Reviewer to their own PR
    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    
    // Reviewer attempts to approve their own PR
    const res = await request(app).post(`/api/review/pull-requests/${prId}/approve`).set('Authorization', `Bearer ${reviewerToken}`);
    expect(res.status).toBe(409);
  });

  it('duplicate approve fails', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    
    await request(app).post(`/api/review/pull-requests/${prId}/approve`).set('Authorization', `Bearer ${reviewerToken}`);
    const res = await request(app).post(`/api/review/pull-requests/${prId}/approve`).set('Authorization', `Bearer ${reviewerToken}`);
    expect(res.status).toBe(409);
  });

  it('request changes', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    
    const res = await request(app).post(`/api/review/pull-requests/${prId}/request-changes`).set('Authorization', `Bearer ${reviewerToken}`);
    expect(res.status).toBe(200);
  });

  it('creator cannot request changes', async () => {
    // Reviewer creates the PR
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${reviewerToken}`).send({});
    const prId = createRes.body.data.id;

    // Admin assigns Reviewer to their own PR
    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    
    // Reviewer attempts to request changes on their own PR
    const res = await request(app).post(`/api/review/pull-requests/${prId}/request-changes`).set('Authorization', `Bearer ${reviewerToken}`);
    expect(res.status).toBe(409);
  });

  it('merge success', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    await request(app).post(`/api/review/pull-requests/${prId}/approve`).set('Authorization', `Bearer ${reviewerToken}`);
    
    const res = await request(app).post(`/api/review/pull-requests/${prId}/merge`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(PRStatus.MERGED);
  });

  it('merge rejected (insufficient approvals)', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    // Notice we do NOT approve it
    
    const res = await request(app).post(`/api/review/pull-requests/${prId}/merge`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('merge rejected (outstanding request changes)', async () => {
    const createRes = await request(app).post('/api/review/pull-requests').set('Authorization', `Bearer ${adminToken}`).send({});
    const prId = createRes.body.data.id;

    await request(app).post(`/api/review/pull-requests/${prId}/reviewers`).set('Authorization', `Bearer ${adminToken}`).send({ userId: reviewerId });
    
    // Create another reviewer to simulate one approved, one request changes (actually we only have 1 reviewer here)
    await request(app).post(`/api/review/pull-requests/${prId}/request-changes`).set('Authorization', `Bearer ${reviewerToken}`).send({});
    
    const res = await request(app).post(`/api/review/pull-requests/${prId}/merge`).set('Authorization', `Bearer ${adminToken}`).send({});
    expect(res.status).toBe(409);
  });

});
