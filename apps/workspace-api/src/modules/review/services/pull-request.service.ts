import { PullRequestRepository } from '../repositories/pull-request.repository';
import { MembershipRepository } from '../../identity/repositories/membership.repository';
import { VersionService } from './version.service';
import { AuditService } from '../../audit/services/audit.service';

export class PullRequestService {
  static async create(orgId: string, authorId: string) {
    // Creator must belong to active organization
    const membership = await MembershipRepository.findByUserIdAndOrgId(authorId, orgId);
    if (!membership) throw new Error('Creator must belong to active organization');

    const pr = await PullRequestRepository.create(orgId, authorId, 1);
    
    // Create an initial version
    await VersionService.createVersion(pr.id);
    
    await AuditService.logAction({
      userId: authorId,
      organizationId: orgId,
      action: 'CREATE_PR',
      resourceType: 'PULL_REQUEST',
      resourceId: pr.id,
    });

    return pr;
  }

  static async getMany(orgId: string) {
    return PullRequestRepository.findMany(orgId);
  }

  static async getOne(id: string, orgId: string) {
    const pr = await PullRequestRepository.findById(id, orgId);
    if (!pr) throw new Error('Pull Request not found');
    return pr;
  }

  static async update(id: string, orgId: string, authorId: string, data: any) {
    const pr = await PullRequestRepository.findById(id, orgId);
    if (!pr) throw new Error('Pull Request not found');
    
    const membership = await MembershipRepository.findByUserIdAndOrgId(authorId, orgId);
    if (!membership) throw new Error('User not found in org');
    
    if (membership.role !== 'ORG_ADMIN' && pr.authorId !== authorId) {
      throw new Error('Forbidden: Only ORG_ADMIN or Creator can update');
    }

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await PullRequestRepository.update(id, orgId, updateData);
    
    // Create version for updates
    if (data.status !== undefined) {
      await VersionService.createVersion(id);
    }
    
    await AuditService.logAction({
      userId: authorId,
      organizationId: orgId,
      action: 'UPDATE_PR',
      resourceType: 'PULL_REQUEST',
      resourceId: id,
      metadata: updateData
    });

    return updated;
  }

  static async delete(id: string, orgId: string, authorId: string) {
    const pr = await PullRequestRepository.findById(id, orgId);
    if (!pr) throw new Error('Pull Request not found');

    const membership = await MembershipRepository.findByUserIdAndOrgId(authorId, orgId);
    if (membership?.role !== 'ORG_ADMIN' && pr.authorId !== authorId) {
      throw new Error('Forbidden: Only ORG_ADMIN or Creator can delete');
    }

    const success = await PullRequestRepository.delete(id, orgId);

    await AuditService.logAction({
      userId: authorId,
      organizationId: orgId,
      action: 'DELETE_PR',
      resourceType: 'PULL_REQUEST',
      resourceId: id,
    });

    return success;
  }
}
