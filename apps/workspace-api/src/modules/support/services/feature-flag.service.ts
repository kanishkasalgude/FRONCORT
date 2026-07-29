import { FeatureFlagRepository } from '../repositories/feature-flag.repository';
import { CreateFeatureFlagInput, UpdateFeatureFlagInput } from '@workspace/shared/validation/support';

export class FeatureFlagService {
  static async createFlag(orgId: string, data: CreateFeatureFlagInput) {
    try {
      return await FeatureFlagRepository.create(orgId, data);
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

  static async updateFlag(id: string, orgId: string, data: UpdateFeatureFlagInput) {
    const flag = await FeatureFlagRepository.update(id, orgId, data);
    if (!flag) throw new Error('Feature flag not found');
    return flag;
  }

  static async deleteFlag(id: string, orgId: string) {
    const success = await FeatureFlagRepository.delete(id, orgId);
    if (!success) throw new Error('Feature flag not found');
    return true;
  }
}
