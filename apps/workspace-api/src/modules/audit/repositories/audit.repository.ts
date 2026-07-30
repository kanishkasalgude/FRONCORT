import { prisma, AuditLog } from '@workspace/database';

export class AuditRepository {
  static async create(
    orgId: string,
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata: any
  ): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        orgId,
        actorId,
        action,
        entityType,
        entityId,
        metadata,
      }
    });
  }
}
