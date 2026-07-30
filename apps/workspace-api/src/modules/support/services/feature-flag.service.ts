import { FeatureFlagRepository } from '../repositories/feature-flag.repository';
import { CreateFeatureFlagInput, UpdateFeatureFlagInput } from '@workspace/shared/validation/support';
import { AuditService } from '../../audit/services/audit.service';

export class FeatureFlagService {
  static async createFlag(orgId: string, actorId: string, data: CreateFeatureFlagInput) {
    try {
      const flag = await FeatureFlagRepository.create(orgId, data);
      await AuditService.logAction({
        userId: actorId,
        organizationId: orgId,
        action: 'CREATE_FEATURE_FLAG',
        resourceType: 'FEATURE_FLAG',
        resourceId: flag.id,
        metadata: data
      });
      return flag;
    } catch (error: any) {
      if (error.code === 'P2002') throw new Error('Feature flag already exists');
      throw error;
    }
  }

  static async getFlags(orgId: string) {
    return FeatureFlagRepository.findMany(orgId);
  }

  static async getFlagById(id: string, orgId: string) {
    const flag = await FeatureFlagRepository.findById(id, orgId);
    if (!flag) throw new Error('Feature flag not found');
    return flag;
  }

  static async updateFlag(id: string, orgId: string, actorId: string, data: UpdateFeatureFlagInput) {
    const flag = await FeatureFlagRepository.update(id, orgId, data);
    if (!flag) throw new Error('Feature flag not found');

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'UPDATE_FEATURE_FLAG',
      resourceType: 'FEATURE_FLAG',
      resourceId: flag.id,
      metadata: data
    });

    return flag;
  }

  static async deleteFlag(id: string, orgId: string, actorId: string) {
    const success = await FeatureFlagRepository.delete(id, orgId);
    if (!success) throw new Error('Feature flag not found');

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'DELETE_FEATURE_FLAG',
      resourceType: 'FEATURE_FLAG',
      resourceId: id,
    });

    return true;
  }
}
