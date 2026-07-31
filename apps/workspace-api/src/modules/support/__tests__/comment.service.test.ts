import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommentService } from '../services/comment.service';
import { CommentRepository } from '../repositories/comment.repository';

vi.mock('../repositories/comment.repository');
vi.mock('../../audit/services/audit.service');

describe('CommentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a comment to a ticket', async () => {
    vi.mocked(CommentRepository.create).mockResolvedValue({ id: 'c1' } as any);
    const result = await CommentService.addComment('t1', 'org1', 'user1', { body: 'Hello' });
    expect(result.id).toBe('c1');
  });

  it('should throw if ticket not found when commenting', async () => {
    vi.mocked(CommentRepository.create).mockResolvedValue(null);
    await expect(CommentService.addComment('t1', 'org1', 'user1', { body: 'Hello' }))
      .rejects.toThrow('Ticket not found');
  });
});
