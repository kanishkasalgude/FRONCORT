import { ReviewerRepository } from '../repositories/reviewer.repository';
import { PullRequestRepository } from '../repositories/pull-request.repository';
import { MembershipRepository } from '../../identity/repositories/membership.repository';
import { VersionService } from './version.service';
import { AuditService } from '../../audit/services/audit.service';

export class ReviewerService {
  static async assignReviewer(prId: string, orgId: string, actorId: string, userId: string) {
    const pr = await PullRequestRepository.findById(prId, orgId);
    if (!pr) throw new Error('Pull Request not found');

    const membership = await MembershipRepository.findByUserIdAndOrgId(userId, orgId);
    if (!membership) {
        const e = new Error('Reviewer must belong to the organization');
        e.name = 'ConflictError';
        throw e;
    }

    const existing = await ReviewerRepository.findByPrIdAndUserId(prId, userId);
    if (existing) {
        const e = new Error('Reviewer already assigned');
        e.name = 'ConflictError';
        throw e;
    }

    const reviewer = await ReviewerRepository.addReviewer(prId, userId);
    
    if (pr.status === 'DRAFT') {
      await PullRequestRepository.update(prId, orgId, { status: 'IN_REVIEW' });
    }

    await VersionService.createVersion(prId);
    
    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'ASSIGN_REVIEWER',
      resourceType: 'PULL_REQUEST',
      resourceId: prId,
      metadata: { reviewerId: userId }
    });

    return reviewer;
  }

  static async removeReviewer(prId: string, orgId: string, actorId: string, reviewerId: string) {
    const pr = await PullRequestRepository.findById(prId, orgId);
    if (!pr) throw new Error('Pull Request not found');

    const success = await ReviewerRepository.removeReviewer(prId, reviewerId);
    if (!success) throw new Error('Reviewer not found');
    
    await VersionService.createVersion(prId);

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'REMOVE_REVIEWER',
      resourceType: 'PULL_REQUEST',
      resourceId: prId,
      metadata: { reviewerId }
    });

    return true;
  }

  static async getReviewers(prId: string, orgId: string) {
    const pr = await PullRequestRepository.findById(prId, orgId);
    if (!pr) throw new Error('Pull Request not found');

    return ReviewerRepository.findByPrId(prId);
  }
}
