import { describe, it, expect, vi } from 'vitest';
import { ReviewerService } from '../../services/reviewer.service';
import { ReviewerRepository } from '../../repositories/reviewer.repository';
import { PullRequestRepository } from '../../repositories/pull-request.repository';
import { MembershipRepository } from '../../../identity/repositories/membership.repository';
import { VersionService } from '../../services/version.service';

vi.mock('../../repositories/reviewer.repository');
vi.mock('../../repositories/pull-request.repository');
vi.mock('../../../identity/repositories/membership.repository');
vi.mock('../../services/version.service');
vi.mock('../../../audit/services/audit.service', () => ({
  AuditService: { logAction: vi.fn() }
}));

describe('ReviewerService Unit', () => {
  it('assigns reviewer and creates version', async () => {
    vi.mocked(PullRequestRepository.findById).mockResolvedValue({ id: 'pr1' } as any);
    vi.mocked(MembershipRepository.findByUserIdAndOrgId).mockResolvedValue({ role: 'REVIEWER' } as any);
    vi.mocked(ReviewerRepository.findByPrIdAndUserId).mockResolvedValue(null);
    vi.mocked(ReviewerRepository.addReviewer).mockResolvedValue({ id: 'rev1' } as any);
    
    await ReviewerService.assignReviewer('pr1', 'org1', 'actorId', 'user1');
    expect(ReviewerRepository.addReviewer).toHaveBeenCalledWith('pr1', 'user1');
    expect(VersionService.createVersion).toHaveBeenCalledWith('pr1');
  });
});
