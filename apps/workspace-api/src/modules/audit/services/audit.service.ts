import { AuditRepository } from '../repositories/audit.repository';

export interface AuditActionPayload {
  userId: string;
  organizationId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: any;
}

export class AuditService {
  static async logAction(payload: AuditActionPayload): Promise<void> {
    try {
      // Ensure we never write sensitive data by accident if passed loosely
      const cleanMetadata = { ...payload.metadata };
      delete cleanMetadata.password;
      delete cleanMetadata.jwt;
      delete cleanMetadata.cookie;
      delete cleanMetadata.refreshToken;

      await AuditRepository.create(
        payload.organizationId,
        payload.userId,
        payload.action,
        payload.resourceType,
        payload.resourceId,
        cleanMetadata
      );
    } catch (error) {
      // Audit failure isolation: Log it but never throw, so the business transaction succeeds.
      console.error('[AuditService] Failed to log action:', error);
    }
  }
}
