import { describe, it, expect, vi } from 'vitest';
import { PullRequestService } from '../../services/pull-request.service';
import { PullRequestRepository } from '../../repositories/pull-request.repository';
import { MembershipRepository } from '../../../identity/repositories/membership.repository';
import { VersionService } from '../../services/version.service';

vi.mock('../../repositories/pull-request.repository');
vi.mock('../../../identity/repositories/membership.repository');
vi.mock('../../services/version.service');
vi.mock('../../../audit/services/audit.service');

describe('PullRequestService Unit', () => {
  it('creates PR and version', async () => {
    vi.mocked(MembershipRepository.findByUserIdAndOrgId).mockResolvedValue({ role: 'ORG_ADMIN' } as any);
    vi.mocked(PullRequestRepository.create).mockResolvedValue({ id: 'pr1' } as any);
    
    await PullRequestService.create('org1', 'user1');
    expect(PullRequestRepository.create).toHaveBeenCalledWith('org1', 'user1', 1);
    expect(VersionService.createVersion).toHaveBeenCalledWith('pr1');
  });

  it('fails create if user not in org', async () => {
    vi.mocked(MembershipRepository.findByUserIdAndOrgId).mockResolvedValue(null);
    await expect(PullRequestService.create('org1', 'user1')).rejects.toThrow('Creator must belong to active organization');
  });
});
