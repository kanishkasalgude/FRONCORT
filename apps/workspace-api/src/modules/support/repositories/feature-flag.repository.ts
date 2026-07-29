import { prisma, FeatureFlag, Prisma } from '@workspace/database';

export class FeatureFlagRepository {
  static async create(orgId: string, data: Prisma.FeatureFlagUncheckedCreateWithoutOrgInput): Promise<FeatureFlag> {
    return prisma.featureFlag.create({
      data: {
        ...data,
        orgId,
      },
    });
  }

  static async findById(id: string, orgId: string): Promise<FeatureFlag | null> {
    return prisma.featureFlag.findFirst({
      where: { id, orgId },
    });
  }

  static async findMany(orgId: string): Promise<FeatureFlag[]> {
    return prisma.featureFlag.findMany({
      where: { orgId },
    });
  }

  static async update(id: string, orgId: string, data: Prisma.FeatureFlagUncheckedUpdateInput): Promise<FeatureFlag | null> {
    const exists = await prisma.featureFlag.findFirst({ where: { id, orgId } });
    if (!exists) return null;

    return prisma.featureFlag.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string, orgId: string): Promise<boolean> {
    const exists = await prisma.featureFlag.findFirst({ where: { id, orgId } });
    if (!exists) return false;

    await prisma.featureFlag.delete({ where: { id } });
    return true;
  }
}
