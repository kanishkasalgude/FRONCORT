import { prisma, ResourceType, ResourceShare } from '@workspace/database';

export class ResourceShareRepository {
  static async createShare(
    sourceOrgId: string,
    targetOrgId: string,
    resourceId: string,
    resourceType: ResourceType,
    sharedByUserId: string
  ): Promise<ResourceShare> {
    return prisma.resourceShare.create({
      data: {
        sourceOrgId,
        targetOrgId,
        resourceId,
        resourceType,
        sharedByUserId,
      }
    });
  }

  static async revokeShare(shareId: string, activeOrgId: string): Promise<ResourceShare> {
    return prisma.resourceShare.update({
      where: {
        id: shareId,
        sourceOrgId: activeOrgId, // Ensures the caller org owns the share
      },
      data: {
        revokedAt: new Date(),
      }
    });
  }

  static async findSharesByResource(resourceId: string, activeOrgId: string): Promise<ResourceShare[]> {
    return prisma.resourceShare.findMany({
      where: {
        resourceId,
        sourceOrgId: activeOrgId,
        revokedAt: null,
      }
    });
  }

  static async findSharedWithMe(activeOrgId: string): Promise<ResourceShare[]> {
    return prisma.resourceShare.findMany({
      where: {
        targetOrgId: activeOrgId,
        revokedAt: null,
      },
      include: {
        sourceOrg: true,
      }
    });
  }

  static async findActiveShare(resourceId: string, activeOrgId: string): Promise<ResourceShare | null> {
    return prisma.resourceShare.findFirst({
      where: {
        resourceId,
        targetOrgId: activeOrgId,
        revokedAt: null,
      }
    });
  }

  static async findActiveShareForTarget(resourceId: string, targetOrgId: string): Promise<ResourceShare | null> {
    return prisma.resourceShare.findFirst({
      where: {
        resourceId,
        targetOrgId,
        revokedAt: null,
      }
    });
  }
}
