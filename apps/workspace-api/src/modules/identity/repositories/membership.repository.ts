import { prisma, OrgMembership } from '@workspace/database';

export class MembershipRepository {
  static async findByUserIdAndOrgId(userId: string, orgId: string): Promise<OrgMembership | null> {
    return prisma.orgMembership.findUnique({
      where: {
        userId_orgId: { userId, orgId },
      },
    });
  }

  static async findFirstByUserId(userId: string): Promise<OrgMembership | null> {
    return prisma.orgMembership.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' }, // Defaults to oldest membership
    });
  }
}
