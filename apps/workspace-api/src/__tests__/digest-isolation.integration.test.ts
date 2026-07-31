import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, Role } from '@workspace/database';
import { DigestService } from '../modules/digest/services/digest.service';

describe('Digest Data Isolation Integration', () => {
  let orgA: any;
  let orgB: any;
  let orgEmpty: any;
  let userA: any;
  let userB: any;
  let userEmpty: any;

  beforeAll(async () => {
    // Delete LLM_API_KEY to force FallbackProvider logic for these tests
    delete process.env.LLM_API_KEY;
    await prisma.$connect();
    
    // Clear data
    await prisma.digest.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.resourceShare.deleteMany();
    await prisma.ticketComment.deleteMany();
    await prisma.ticketAttachment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.pRReviewer.deleteMany();
    await prisma.pRVersion.deleteMany();
    await prisma.pullRequest.deleteMany();
    await prisma.featureFlag.deleteMany();
    await prisma.orgConnection.deleteMany();
    await prisma.orgMembership.deleteMany();
    await prisma.session.deleteMany();
    await prisma.org.deleteMany();
    await prisma.user.deleteMany();

    // Create Orgs
    orgA = await prisma.org.create({ data: { name: 'Digest Org A' } });
    orgB = await prisma.org.create({ data: { name: 'Digest Org B' } });
    orgEmpty = await prisma.org.create({ data: { name: 'Digest Org Empty' } });

    // Create Users
    userA = await prisma.user.create({ data: { email: 'user.a@digest.com', passwordHash: 'hash' } });
    userB = await prisma.user.create({ data: { email: 'user.b@digest.com', passwordHash: 'hash' } });
    userEmpty = await prisma.user.create({ data: { email: 'user.empty@digest.com', passwordHash: 'hash' } });

    // Memberships
    await prisma.orgMembership.create({ data: { userId: userA.id, orgId: orgA.id, role: Role.ORG_ADMIN } });
    await prisma.orgMembership.create({ data: { userId: userB.id, orgId: orgB.id, role: Role.ORG_ADMIN } });
    await prisma.orgMembership.create({ data: { userId: userEmpty.id, orgId: orgEmpty.id, role: Role.ORG_ADMIN } });

    // Create isolated audit logs
    // Org A gets 3 audits
    await prisma.auditLog.createMany({
      data: [
        { orgId: orgA.id, actorId: userA.id, action: 'REVIEW_PR', entityType: 'PULL_REQUEST', entityId: 'pr1', metadata: {} },
        { orgId: orgA.id, actorId: userA.id, action: 'UPDATE_TICKET', entityType: 'TICKET', entityId: 't1', metadata: { status: 'CLOSED' } },
        { orgId: orgA.id, actorId: userA.id, action: 'REVIEW_PR', entityType: 'PULL_REQUEST', entityId: 'pr2', metadata: {} },
      ]
    });

    // Org B gets 5 audits
    await prisma.auditLog.createMany({
      data: [
        { orgId: orgB.id, actorId: userB.id, action: 'REVIEW_PR', entityType: 'PULL_REQUEST', entityId: 'pr3', metadata: {} },
        { orgId: orgB.id, actorId: userB.id, action: 'REVIEW_PR', entityType: 'PULL_REQUEST', entityId: 'pr4', metadata: {} },
        { orgId: orgB.id, actorId: userB.id, action: 'DELETE_TICKET', entityType: 'TICKET', entityId: 't2', metadata: {} },
        { orgId: orgB.id, actorId: userB.id, action: 'DELETE_TICKET', entityType: 'TICKET', entityId: 't3', metadata: {} },
        { orgId: orgB.id, actorId: userB.id, action: 'SHARE_RESOURCE', entityType: 'TICKET', entityId: 't4', metadata: {} },
      ]
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Org A digest excludes Org B', async () => {
    await (DigestService as any).generateDigestForUser(userA.id, orgA.id);
    const digestA = await prisma.digest.findFirst({
      where: { orgId: orgA.id, userId: userA.id },
      orderBy: { generatedAt: 'desc' }
    });
    
    expect(digestA).toBeDefined();
    // We expect fallback counting logic output here since we test the un-mocked deterministic logic by default
    expect(digestA?.summary).toContain('2 Pull Requests reviewed');
    expect(digestA?.summary).toContain('1 Tickets closed');
    expect(digestA?.summary).not.toContain('Resources shared'); 
  });

  it('Org B digest excludes Org A', async () => {
    await (DigestService as any).generateDigestForUser(userB.id, orgB.id);
    const digestB = await prisma.digest.findFirst({
      where: { orgId: orgB.id, userId: userB.id },
      orderBy: { generatedAt: 'desc' }
    });

    expect(digestB).toBeDefined();
    expect(digestB?.summary).toContain('2 Pull Requests reviewed');
    expect(digestB?.summary).toContain('2 Tickets closed');
    expect(digestB?.summary).toContain('1 Resources shared');
  });

  it('Shared resource events handled correctly', async () => {
    await prisma.auditLog.create({
      data: { orgId: orgB.id, actorId: userB.id, action: 'SHARE_RESOURCE', entityType: 'TICKET', entityId: 't1', metadata: { targetOrgId: orgB.id } }
    });

    await (DigestService as any).generateDigestForUser(userB.id, orgB.id);
    const digests = await prisma.digest.findMany({
      where: { orgId: orgB.id, userId: userB.id },
      orderBy: { generatedAt: 'desc' }
    });
    // The most recent digest for Org B will have the 1 new share
    expect(digests[0].summary).toContain('1 Resources shared');
  });

  it('Empty organization produces empty digest', async () => {
    await (DigestService as any).generateDigestForUser(userEmpty.id, orgEmpty.id);
    const digest = await prisma.digest.findFirst({
      where: { orgId: orgEmpty.id, userId: userEmpty.id }
    });
    // If there's 0 events, DigestService should return early and not create a digest
    expect(digest).toBeNull();
  });
});
