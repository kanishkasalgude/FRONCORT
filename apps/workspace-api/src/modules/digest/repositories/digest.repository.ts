import { prisma, Digest } from '@workspace/database';

export class DigestRepository {
  static async create(userId: string, orgId: string, summary: string): Promise<Digest> {
    return prisma.digest.create({
      data: {
        userId,
        orgId,
        summary,
      }
    });
  }

  static async getLastDigestTime(userId: string, orgId: string): Promise<Date | null> {
    const lastDigest = await prisma.digest.findFirst({
      where: { userId, orgId },
      orderBy: { generatedAt: 'desc' },
      select: { generatedAt: true }
    });
    return lastDigest?.generatedAt || null;
  }

  // Gets the newly created audit logs per user+org
  static async getUnprocessedAudits(orgId: string, userId: string, since: Date | null) {
    const whereClause: any = {
      orgId,
      actorId: userId,
    };
    
    if (since) {
      whereClause.createdAt = { gt: since };
    }

    return prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    });
  }

  static async getActiveUsersAndOrgs() {
    // Returns distinct pairs of actorId and orgId who have audit logs
    const pairs = await prisma.auditLog.findMany({
      select: { actorId: true, orgId: true },
      distinct: ['actorId', 'orgId']
    });
    return pairs;
  }
}
