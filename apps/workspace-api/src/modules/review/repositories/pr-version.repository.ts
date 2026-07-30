import { prisma, PRVersion } from '@workspace/database';

export class PRVersionRepository {
  static async createVersion(prId: string): Promise<PRVersion> {
    // Generate an incremental version number
    const latestVersion = await prisma.pRVersion.findFirst({
      where: { prId },
      orderBy: { versionNumber: 'desc' }
    });

    const nextVersion = latestVersion ? latestVersion.versionNumber + 1 : 1;

    return prisma.pRVersion.create({
      data: {
        prId,
        versionNumber: nextVersion,
      }
    });
  }

  static async findByPrId(prId: string): Promise<PRVersion[]> {
    return prisma.pRVersion.findMany({
      where: { prId },
      orderBy: { versionNumber: 'desc' },
    });
  }
}
