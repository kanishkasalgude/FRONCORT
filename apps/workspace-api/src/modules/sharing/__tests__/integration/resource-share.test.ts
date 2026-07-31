import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { execSync } from 'child_process';
import app from '../../../../app';
import { prisma, Role, ConnectionStatus, ResourceType, PRStatus } from '@workspace/database';
import { JwtService } from '../../../identity/services/jwt.service';

describe('Resource Share Integration (Real DB)', () => {
  let orgA_Id: string;
  let orgB_Id: string;
  let orgC_Id: string;
  let orgA_AdminToken: string;
  let orgB_AdminToken: string;
  let orgC_AdminToken: string;
  let prId: string;

  beforeAll(async () => {
    // Push the schema to the test database
    execSync('npx prisma db push --schema ../../packages/database/prisma/schema.prisma --skip-generate', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });

    await prisma.$connect();

    // Create 3 Orgs
    const orgA = await prisma.org.create({ data: { name: 'Org A' } });
    const orgB = await prisma.org.create({ data: { name: 'Org B' } });
    const orgC = await prisma.org.create({ data: { name: 'Org C' } });
    orgA_Id = orgA.id;
    orgB_Id = orgB.id;
    orgC_Id = orgC.id;

    // Create Admins
    const adminA = await prisma.user.create({ data: { email: `a_${Date.now()}@test.com`, passwordHash: 'hash' } });
    const adminB = await prisma.user.create({ data: { email: `b_${Date.now()}@test.com`, passwordHash: 'hash' } });
    const adminC = await prisma.user.create({ data: { email: `c_${Date.now()}@test.com`, passwordHash: 'hash' } });

    await prisma.orgMembership.create({ data: { userId: adminA.id, orgId: orgA.id, role: Role.ORG_ADMIN } });
    await prisma.orgMembership.create({ data: { userId: adminB.id, orgId: orgB.id, role: Role.ORG_ADMIN } });
    await prisma.orgMembership.create({ data: { userId: adminC.id, orgId: orgC.id, role: Role.ORG_ADMIN } });

    const sA = await prisma.session.create({ data: { userId: adminA.id, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() + 1000000) } });
    const sB = await prisma.session.create({ data: { userId: adminB.id, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() + 1000000) } });
    const sC = await prisma.session.create({ data: { userId: adminC.id, refreshTokenHash: 'hash', expiresAt: new Date(Date.now() + 1000000) } });

    orgA_AdminToken = JwtService.generateAccessToken({ userId: adminA.id, sessionId: sA.id, activeOrgId: orgA.id, role: Role.ORG_ADMIN });
    orgB_AdminToken = JwtService.generateAccessToken({ userId: adminB.id, sessionId: sB.id, activeOrgId: orgB.id, role: Role.ORG_ADMIN });
    orgC_AdminToken = JwtService.generateAccessToken({ userId: adminC.id, sessionId: sC.id, activeOrgId: orgC.id, role: Role.ORG_ADMIN });
  });

  afterAll(async () => {
    // Delete all records seeded for testing
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

  beforeEach(async () => {
    // Create connection A -> B
    await prisma.orgConnection.create({
      data: { requesterOrgId: orgA_Id, partnerOrgId: orgB_Id, status: ConnectionStatus.CONNECTED }
    });
    // Create PR in Org A
    const pr = await prisma.pullRequest.create({
      data: { orgId: orgA_Id, authorId: (await prisma.user.findFirst({ where: { memberships: { some: { orgId: orgA_Id } } } }))!.id, requiredApprovals: 1 }
    });
    prId = pr.id;
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.resourceShare.deleteMany({ where: { sourceOrgId: { in: [orgA_Id, orgB_Id, orgC_Id] } } });
    await prisma.pRVersion.deleteMany({ where: { pr: { orgId: { in: [orgA_Id, orgB_Id, orgC_Id] } } } });
    await prisma.pullRequest.deleteMany({ where: { orgId: { in: [orgA_Id, orgB_Id, orgC_Id] } } });
    await prisma.orgConnection.deleteMany({ where: { requesterOrgId: { in: [orgA_Id, orgB_Id, orgC_Id] } } });
  });

  it('Create share', async () => {
    const res = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    expect(res.status).toBe(201);
    expect(res.body.data.targetOrgId).toBe(orgB_Id);
  });

  it('Duplicate share rejected', async () => {
    await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    const res = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    expect(res.status).toBe(409);
  });

  it('Invalid OrgConnection rejected', async () => {
    // A -> C is NOT connected
    const res = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgC_Id });
    expect(res.status).toBe(409);
  });

  it('Share revoked', async () => {
    const shareRes = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    const shareId = shareRes.body.data.id;

    const res = await request(app).delete(`/api/sharing/resources/${prId}/share/${shareId}`).set('Authorization', `Bearer ${orgA_AdminToken}`);
    expect(res.status).toBe(200);
  });

  it('Shared resource visible', async () => {
    await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });

    const res = await request(app).get(`/api/sharing/resources/${prId}`).set('Authorization', `Bearer ${orgB_AdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.shared).toBe(true);
    expect(res.body.data.ownerOrganizationId).toBe(orgA_Id);
    expect(res.body.data.receiverOrganizationId).toBe(orgB_Id);
  });

  it('Cross-org resource hidden', async () => {
    // Org C tries to access Org A's PR
    const res = await request(app).get(`/api/sharing/resources/${prId}`).set('Authorization', `Bearer ${orgC_AdminToken}`);
    expect(res.status).toBe(404);
  });

  it('owner cannot create duplicate share', async () => {
    await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    const res = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    expect(res.status).toBe(409);
  });

  it('revoked share can be recreated', async () => {
    const shareRes = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    await request(app).delete(`/api/sharing/resources/${prId}/share/${shareRes.body.data.id}`).set('Authorization', `Bearer ${orgA_AdminToken}`);
    
    // Create again
    const res = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    expect(res.status).toBe(201);
  });

  it('receiver cannot reshare', async () => {
    await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });

    // Org B tries to share with Org C
    const res = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgB_AdminToken}`).send({ targetOrgId: orgC_Id });
    expect(res.status).toBe(409); // Returns 409 because B doesn't own it
  });

  it('receiver cannot modify', async () => {
    await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });

    // Review console PATCH uses activeOrgId, so it should return 404/Forbidden
    const res = await request(app).patch(`/api/review/pull-requests/${prId}`).set('Authorization', `Bearer ${orgB_AdminToken}`).send({ status: PRStatus.IN_REVIEW });
    // It'll likely return 404 Not Found since review endpoint filters by org
    expect(res.status).toBe(404);
  });

  it('receiver cannot merge', async () => {
    await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    const res = await request(app).post(`/api/review/pull-requests/${prId}/merge`).set('Authorization', `Bearer ${orgB_AdminToken}`);
    expect(res.status).toBe(404);
  });

  it('receiver cannot approve', async () => {
    await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    const res = await request(app).post(`/api/review/pull-requests/${prId}/approve`).set('Authorization', `Bearer ${orgB_AdminToken}`);
    expect(res.status).toBe(404);
  });

  it('receiver cannot request changes', async () => {
    await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    const res = await request(app).post(`/api/review/pull-requests/${prId}/request-changes`).set('Authorization', `Bearer ${orgB_AdminToken}`);
    expect(res.status).toBe(404);
  });

  it('revoked shares disappear from shared-with-me', async () => {
    const shareRes = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    const shareId = shareRes.body.data.id;

    await request(app).delete(`/api/sharing/resources/${prId}/share/${shareId}`).set('Authorization', `Bearer ${orgA_AdminToken}`);
    
    const res = await request(app).get(`/api/sharing/shared-with-me`).set('Authorization', `Bearer ${orgB_AdminToken}`);
    expect(res.body.data.length).toBe(0);
  });

  it('revoked shares disappear from resource lookup', async () => {
    const shareRes = await request(app).post(`/api/sharing/resources/${prId}/share`).set('Authorization', `Bearer ${orgA_AdminToken}`).send({ targetOrgId: orgB_Id });
    const shareId = shareRes.body.data.id;

    await request(app).delete(`/api/sharing/resources/${prId}/share/${shareId}`).set('Authorization', `Bearer ${orgA_AdminToken}`);
    
    const res = await request(app).get(`/api/sharing/resources/${prId}`).set('Authorization', `Bearer ${orgB_AdminToken}`);
    expect(res.status).toBe(404);
  });
});
