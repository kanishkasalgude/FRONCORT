import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma, Role } from '@workspace/database';
import { DigestService } from '../modules/digest/services/digest.service';

describe('AI Digest Isolation Tests', () => {
  let orgA: any;
  let orgB: any;
  let orgC: any;
  let userA: any;
  let userB: any;
  let userC: any;

  beforeAll(async () => {
    // Force FallbackProvider for deterministic assertion in isolation testing
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
    orgA = await prisma.org.create({ data: { name: 'Org A' } });
    orgB = await prisma.org.create({ data: { name: 'Org B' } });
    orgC = await prisma.org.create({ data: { name: 'Org C' } });

    // Create Users
    userA = await prisma.user.create({ data: { email: 'usera@example.com', passwordHash: 'hash' } });
    userB = await prisma.user.create({ data: { email: 'userb@example.com', passwordHash: 'hash' } });
    userC = await prisma.user.create({ data: { email: 'userc@example.com', passwordHash: 'hash' } });

    // Memberships
    await prisma.orgMembership.create({ data: { userId: userA.id, orgId: orgA.id, role: Role.ORG_ADMIN } });
    await prisma.orgMembership.create({ data: { userId: userB.id, orgId: orgB.id, role: Role.ORG_ADMIN } });
    await prisma.orgMembership.create({ data: { userId: userC.id, orgId: orgC.id, role: Role.ORG_ADMIN } });

    // Org A gets exactly 10 Closed Tickets
    const orgAAudits = Array.from({ length: 10 }).map((_, i) => ({
      orgId: orgA.id, actorId: userA.id, action: 'UPDATE_TICKET', entityType: 'TICKET', entityId: `tA${i}`, metadata: { status: 'CLOSED' }
    }));
    
    // Org B gets exactly 20 Reviewed PRs
    const orgBAudits = Array.from({ length: 20 }).map((_, i) => ({
      orgId: orgB.id, actorId: userB.id, action: 'REVIEW_PR', entityType: 'PULL_REQUEST', entityId: `prB${i}`, metadata: {}
    }));

    // Org C gets exactly 30 Shared Resources
    const orgCAudits = Array.from({ length: 30 }).map((_, i) => ({
      orgId: orgC.id, actorId: userC.id, action: 'SHARE_RESOURCE', entityType: 'TICKET', entityId: `tC${i}`, metadata: {}
    }));

    await prisma.auditLog.createMany({ data: [...orgAAudits, ...orgBAudits, ...orgCAudits] });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Org A digest contains ONLY Org A data', async () => {
    await (DigestService as any).generateDigestForUser(userA.id, orgA.id);
    const digestA = await prisma.digest.findFirst({
      where: { orgId: orgA.id, userId: userA.id },
      orderBy: { generatedAt: 'desc' }
    });
    
    expect(digestA).toBeDefined();
    // Org A has 10 closed tickets
    expect(digestA?.summary).toContain('10 Tickets closed');
    
    // Verify it doesn't leak B or C
    expect(digestA?.summary).not.toContain('Pull Requests reviewed');
    expect(digestA?.summary).not.toContain('Resources shared');
  });

  it('Org B digest contains ONLY Org B data', async () => {
    await (DigestService as any).generateDigestForUser(userB.id, orgB.id);
    const digestB = await prisma.digest.findFirst({
      where: { orgId: orgB.id, userId: userB.id },
      orderBy: { generatedAt: 'desc' }
    });

    expect(digestB).toBeDefined();
    // Org B has 20 PR reviews
    expect(digestB?.summary).toContain('20 Pull Requests reviewed');

    // Verify it doesn't leak A or C
    expect(digestB?.summary).not.toContain('Tickets closed');
    expect(digestB?.summary).not.toContain('Resources shared');
  });

  it('Org C digest contains ONLY Org C data', async () => {
    await (DigestService as any).generateDigestForUser(userC.id, orgC.id);
    const digestC = await prisma.digest.findFirst({
      where: { orgId: orgC.id, userId: userC.id },
      orderBy: { generatedAt: 'desc' }
    });

    expect(digestC).toBeDefined();
    // Org C has 30 Shared resources
    expect(digestC?.summary).toContain('30 Resources shared');

    // Verify it doesn't leak A or B
    expect(digestC?.summary).not.toContain('Tickets closed');
    expect(digestC?.summary).not.toContain('Pull Requests reviewed');
  });
});
