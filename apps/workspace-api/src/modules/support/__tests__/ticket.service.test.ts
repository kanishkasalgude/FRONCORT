import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketService } from '../services/ticket.service';
import { TicketRepository } from '../repositories/ticket.repository';
import { MembershipRepository } from '../../identity/repositories/membership.repository';

vi.mock('../repositories/ticket.repository');
vi.mock('../../identity/repositories/membership.repository');

describe('TicketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a ticket without assignee', async () => {
    vi.mocked(TicketRepository.create).mockResolvedValue({ id: 't1' } as any);
    const result = await TicketService.createTicket('org1', 'user1', { title: 'Test' });
    expect(result.id).toBe('t1');
  });

  it('should reject assignment to non-member during creation', async () => {
    vi.mocked(MembershipRepository.findByUserIdAndOrgId).mockResolvedValue(null);
    await expect(TicketService.createTicket('org1', 'user1', { title: 'Test', assignedToId: 'user2' }))
      .rejects.toThrow('Assignee is not a member of the organization');
  });
  
  it('should update ticket status', async () => {
    vi.mocked(TicketRepository.update).mockResolvedValue({ id: 't1', status: 'IN_PROGRESS' } as any);
    const result = await TicketService.updateStatus('t1', 'org1', { status: 'IN_PROGRESS' });
    expect(result.status).toBe('IN_PROGRESS');
  });
});
