import { ReviewerRepository } from '../repositories/reviewer.repository';
import { PullRequestRepository } from '../repositories/pull-request.repository';
import { VersionService } from './version.service';
import { PRStatus, ApprovalStatus } from '@workspace/database';
import { AuditService } from '../../audit/services/audit.service';

export class ReviewService {
  static async approve(prId: string, orgId: string, userId: string) {
    const pr = await PullRequestRepository.findById(prId, orgId);
    if (!pr) throw new Error('Pull Request not found');

    if (pr.authorId === userId) {
        const e = new Error('Creator cannot approve their own PR');
        e.name = 'ConflictError';
        throw e;
    }

    const reviewer = await ReviewerRepository.findByPrIdAndUserId(prId, userId);
    if (!reviewer) {
        const e = new Error('Only assigned reviewers may approve');
        e.name = 'ForbiddenError';
        throw e;
    }

    if (reviewer.approvalStatus === ApprovalStatus.APPROVED) {
      const e = new Error('Duplicate approval');
      e.name = 'ConflictError';
      throw e;
    }

    const updated = await ReviewerRepository.updateStatus(reviewer.id, ApprovalStatus.APPROVED);

    await AuditService.logAction({
      userId,
      organizationId: orgId,
      action: 'APPROVE_PR',
      resourceType: 'PULL_REQUEST',
      resourceId: prId,
    });

    return updated;
  }

  static async requestChanges(prId: string, orgId: string, userId: string) {
    const pr = await PullRequestRepository.findById(prId, orgId);
    if (!pr) throw new Error('Pull Request not found');

    if (pr.authorId === userId) {
        const e = new Error('Creator cannot request changes on their own PR');
        e.name = 'ConflictError';
        throw e;
    }

    const reviewer = await ReviewerRepository.findByPrIdAndUserId(prId, userId);
    if (!reviewer) {
        const e = new Error('Only assigned reviewers may request changes');
        e.name = 'ForbiddenError';
        throw e;
    }

    const updated = await ReviewerRepository.updateStatus(reviewer.id, ApprovalStatus.CHANGES_REQUESTED);

    await AuditService.logAction({
      userId,
      organizationId: orgId,
      action: 'REQUEST_CHANGES_PR',
      resourceType: 'PULL_REQUEST',
      resourceId: prId,
    });

    return updated;
  }

  static async merge(prId: string, orgId: string, actorId: string) {
    const pr = await PullRequestRepository.findById(prId, orgId);
    if (!pr) throw new Error('Pull Request not found');

    if (pr.status !== PRStatus.DRAFT && pr.status !== PRStatus.IN_REVIEW) {
        const e = new Error('PR status must be OPEN');
        e.name = 'ConflictError';
        throw e;
    }

    const approvals = pr.reviewers.filter(r => r.approvalStatus === ApprovalStatus.APPROVED).length;
    if (approvals < pr.requiredApprovals) {
        const e = new Error('Required approval count not reached');
        e.name = 'ConflictError';
        throw e;
    }

    const changesRequested = pr.reviewers.some(r => r.approvalStatus === ApprovalStatus.CHANGES_REQUESTED);
    if (changesRequested) {
        const e = new Error('Reviewer has outstanding REQUEST_CHANGES');
        e.name = 'ConflictError';
        throw e;
    }

    const updated = await PullRequestRepository.update(prId, orgId, { status: PRStatus.MERGED });
    await VersionService.createVersion(prId);

    await AuditService.logAction({
      userId: actorId,
      organizationId: orgId,
      action: 'MERGE_PR',
      resourceType: 'PULL_REQUEST',
      resourceId: prId,
    });

    return updated;
  }
}
