// Database Seed Script
import { PrismaClient, Role, TicketStatus, PRStatus, ResourceType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const demoHash = await bcrypt.hash('Password123!', 10);
  
  console.log('Cleaning database...');
  await prisma.digest.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.resourceShare.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticketAttachment.deleteMany();
  await prisma.ticket.deleteMany();
  await (prisma as any).pRCreationEvent?.deleteMany().catch(()=> {});
  await prisma.pRReviewer.deleteMany();
  await prisma.pRVersion.deleteMany();
  await prisma.pullRequest.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.orgConnection.deleteMany();
  await prisma.orgMembership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.org.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  console.log('Creating users...');
  // Stark
  const tony = await prisma.user.create({ data: { email: 'tony@stark.com', passwordHash: demoHash } });
  const pepper = await prisma.user.create({ data: { email: 'pepper@stark.com', passwordHash: demoHash } });
  const happy = await prisma.user.create({ data: { email: 'happy@stark.com', passwordHash: demoHash } });
  
  // Wayne
  const bruce = await prisma.user.create({ data: { email: 'bruce@wayne.com', passwordHash: demoHash } });
  const lucius = await prisma.user.create({ data: { email: 'lucius@wayne.com', passwordHash: demoHash } });
  const alfred = await prisma.user.create({ data: { email: 'alfred@wayne.com', passwordHash: demoHash } });

  // --- Orgs ---
  console.log('Creating orgs...');
  const starkOrg = await prisma.org.create({ data: { name: 'Stark Industries' } });
  const wayneOrg = await prisma.org.create({ data: { name: 'Wayne Enterprises' } });

  // --- Memberships ---
  console.log('Creating memberships...');
  await prisma.orgMembership.createMany({
    data: [
      { userId: tony.id, orgId: starkOrg.id, role: Role.ORG_ADMIN },
      { userId: pepper.id, orgId: starkOrg.id, role: Role.SUPPORT_AGENT },
      { userId: happy.id, orgId: starkOrg.id, role: Role.REVIEWER },
      
      { userId: bruce.id, orgId: wayneOrg.id, role: Role.ORG_ADMIN },
      { userId: lucius.id, orgId: wayneOrg.id, role: Role.SUPPORT_AGENT },
      { userId: alfred.id, orgId: wayneOrg.id, role: Role.REVIEWER },
    ]
  });

  // --- Tickets ---
  console.log('Creating tickets...');
  await prisma.ticket.createMany({
    data: [
      // Stark
      { orgId: starkOrg.id, title: 'Arc Reactor Failure', creatorId: tony.id, assignedToId: pepper.id, status: TicketStatus.OPEN },
      { orgId: starkOrg.id, title: 'JARVIS Authentication Bug', creatorId: happy.id, assignedToId: pepper.id, status: TicketStatus.IN_PROGRESS },
      { orgId: starkOrg.id, title: 'Armor Deployment Issue', creatorId: tony.id, status: TicketStatus.OPEN },
      
      // Wayne
      { orgId: wayneOrg.id, title: 'Batmobile Diagnostics', creatorId: bruce.id, assignedToId: lucius.id, status: TicketStatus.OPEN },
      { orgId: wayneOrg.id, title: 'Cave Access Control', creatorId: alfred.id, status: TicketStatus.IN_PROGRESS },
      { orgId: wayneOrg.id, title: 'Inventory Sync', creatorId: bruce.id, assignedToId: lucius.id, status: TicketStatus.RESOLVED },
    ]
  });

  // --- Feature Flags ---
  console.log('Creating feature flags...');
  await prisma.featureFlag.createMany({
    data: [
      // Stark
      { orgId: starkOrg.id, key: 'AI Copilot', enabled: true },
      { orgId: starkOrg.id, key: 'Smart Review', enabled: false },
      
      // Wayne
      { orgId: wayneOrg.id, key: 'Night Mode', enabled: true },
      { orgId: wayneOrg.id, key: 'Gotham Analytics', enabled: true },
    ]
  });

  // --- Pull Requests ---
  console.log('Creating pull requests...');
  await prisma.pullRequest.createMany({
    data: [
      // Stark
      { orgId: starkOrg.id, authorId: tony.id, status: PRStatus.IN_REVIEW }, 
      { orgId: starkOrg.id, authorId: happy.id, status: PRStatus.DRAFT },
      
      // Wayne
      { orgId: wayneOrg.id, authorId: lucius.id, status: PRStatus.IN_REVIEW },
      { orgId: wayneOrg.id, authorId: bruce.id, status: PRStatus.APPROVED },
    ]
  });
  
  const prStark1 = await prisma.pullRequest.findFirst({ where: { orgId: starkOrg.id, authorId: tony.id } });
  const prStark2 = await prisma.pullRequest.findFirst({ where: { orgId: starkOrg.id, authorId: happy.id } });
  const prWayne1 = await prisma.pullRequest.findFirst({ where: { orgId: wayneOrg.id, authorId: lucius.id } });
  const prWayne2 = await prisma.pullRequest.findFirst({ where: { orgId: wayneOrg.id, authorId: bruce.id } });

  await prisma.auditLog.createMany({
    data: [
      { orgId: starkOrg.id, actorId: tony.id, action: 'PR_CREATED', entityType: 'PULL_REQUEST', entityId: prStark1!.id, metadata: { title: 'AI Assistant Refactor' } },
      { orgId: starkOrg.id, actorId: happy.id, action: 'PR_CREATED', entityType: 'PULL_REQUEST', entityId: prStark2!.id, metadata: { title: 'Authentication Middleware' } },
      
      { orgId: wayneOrg.id, actorId: lucius.id, action: 'PR_CREATED', entityType: 'PULL_REQUEST', entityId: prWayne1!.id, metadata: { title: 'Security Dashboard' } },
      { orgId: wayneOrg.id, actorId: bruce.id, action: 'PR_CREATED', entityType: 'PULL_REQUEST', entityId: prWayne2!.id, metadata: { title: 'Equipment Tracking' } },
    ]
  });

  console.log('Seeding completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
