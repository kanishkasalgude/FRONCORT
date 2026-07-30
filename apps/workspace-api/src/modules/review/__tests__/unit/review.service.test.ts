import { describe, it, expect, vi } from 'vitest';
import { ReviewService } from '../../services/review.service';
import { ReviewerRepository } from '../../repositories/reviewer.repository';
import { PullRequestRepository } from '../../repositories/pull-request.repository';
import { VersionService } from '../../services/version.service';
import { PRStatus, ApprovalStatus } from '@workspace/database';

vi.mock('../../repositories/reviewer.repository');
vi.mock('../../repositories/pull-request.repository');
vi.mock('../../services/version.service');
vi.mock('../../../audit/services/audit.service', () => ({
  AuditService: { logAction: vi.fn() }
}));

describe('ReviewService Unit', () => {
  it('approves successfully', async () => {
    vi.mocked(PullRequestRepository.findById).mockResolvedValue({ id: 'pr1', authorId: 'user1' } as any);
    vi.mocked(ReviewerRepository.findByPrIdAndUserId).mockResolvedValue({ id: 'rev1', approvalStatus: ApprovalStatus.PENDING } as any);
    vi.mocked(ReviewerRepository.updateStatus).mockResolvedValue({ id: 'rev1' } as any);
    
    await ReviewService.approve('pr1', 'org1', 'user2');
    expect(ReviewerRepository.updateStatus).toHaveBeenCalledWith('rev1', ApprovalStatus.APPROVED);
    expect(VersionService.createVersion).not.toHaveBeenCalled(); // No version for approve
  });

  it('merges successfully', async () => {
    vi.mocked(PullRequestRepository.findById).mockResolvedValue({ 
      id: 'pr1', 
      status: PRStatus.DRAFT, 
      requiredApprovals: 1, 
      reviewers: [{ approvalStatus: ApprovalStatus.APPROVED }] 
    } as any);
    vi.mocked(PullRequestRepository.update).mockResolvedValue({ id: 'pr1', status: PRStatus.MERGED } as any);
    
    await ReviewService.merge('pr1', 'org1', 'user1');
    expect(PullRequestRepository.update).toHaveBeenCalledWith('pr1', 'org1', { status: PRStatus.MERGED });
    expect(VersionService.createVersion).toHaveBeenCalledWith('pr1'); // Version for merge
  });
});
