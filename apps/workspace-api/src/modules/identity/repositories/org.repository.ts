import { prisma, Org } from '@workspace/database';

export class OrgRepository {
  static async findById(id: string): Promise<Org | null> {
    return prisma.org.findUnique({ where: { id } });
  }

  static async findUserOrgs(userId: string): Promise<Org[]> {
    return prisma.org.findMany({
      where: {
        memberships: {
          some: { userId },
        },
      },
    });
  }
}
