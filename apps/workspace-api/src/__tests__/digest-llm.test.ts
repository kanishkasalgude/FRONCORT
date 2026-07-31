import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LlmProvider } from '../modules/digest/providers/llm.provider';
import { FallbackProvider } from '../modules/digest/providers/fallback.provider';
import { DigestService } from '../modules/digest/services/digest.service';
import { DigestRepository } from '../modules/digest/repositories/digest.repository';
import { prisma } from '@workspace/database';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock the database dependencies for DigestService to test fallback logic
vi.mock('../modules/digest/repositories/digest.repository', () => ({
  DigestRepository: {
    getLastDigestTime: vi.fn().mockResolvedValue(new Date(0)),
    getUnprocessedAudits: vi.fn(),
    create: vi.fn(),
  }
}));

vi.mock('@workspace/database', () => ({
  prisma: {
    org: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  }
}));

describe('AI Digest Service & Provider Tests', () => {
  const dummyOrg = { id: 'org1', name: 'Test Org' } as any;
  const dummyUser = { id: 'user1', email: 'test@example.com' } as any;
  const dummyEvents = [
    { orgId: 'org1', action: 'REVIEW_PR', entityType: 'PULL_REQUEST', metadata: { status: 'APPROVED' } },
    { orgId: 'org2', action: 'REVIEW_PR', entityType: 'PULL_REQUEST', metadata: { status: 'APPROVED' } },
  ] as any[];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LLM_API_KEY = 'test_key';
    
    // Setup generic mocked DB responses
    (prisma.org.findUnique as any).mockResolvedValue(dummyOrg);
    (prisma.user.findUnique as any).mockResolvedValue(dummyUser);
    (DigestRepository.create as any).mockResolvedValue({});
  });

  afterEach(() => {
    delete process.env.LLM_API_KEY;
  });

  it('Prompt only contains current org data and sanitizes output', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'LLM Summary' } }] })
    });

    const provider = new LlmProvider('test_key');
    await provider.generateSummary(dummyEvents, dummyOrg, dummyUser);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    
    const callArgs = fetchMock.mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    const prompt = body.messages[0].content;

    // Must contain org1 data
    expect(prompt).toContain('REVIEW_PR');
    // Must NOT contain org2 leak (because LlmProvider filters by orgId)
    const sanitizedArray = JSON.parse(prompt.split('Audit Events:')[1].split('Generate')[0].trim());
    expect(sanitizedArray).toHaveLength(1); // Only org1's event
  });

  it('Fallback activates without API key', async () => {
    delete process.env.LLM_API_KEY;
    (DigestRepository.getUnprocessedAudits as any).mockResolvedValue([dummyEvents[0]]);

    // Spy on FallbackProvider
    const fallbackSpy = vi.spyOn(FallbackProvider.prototype, 'generateSummary');

    await (DigestService as any).generateDigestForUser(dummyUser.id, dummyOrg.id);

    expect(fallbackSpy).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Timeout falls back to deterministic provider', async () => {
    // Simulate LLM throw / Timeout
    fetchMock.mockRejectedValue(new Error('The operation was aborted'));
    (DigestRepository.getUnprocessedAudits as any).mockResolvedValue([dummyEvents[0]]);

    const fallbackSpy = vi.spyOn(FallbackProvider.prototype, 'generateSummary');

    await (DigestService as any).generateDigestForUser(dummyUser.id, dummyOrg.id);

    // It should try LLM (with 1 retry, so 2 times) and then fallback
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fallbackSpy).toHaveBeenCalled();
  });

  it('Empty datasets are handled gracefully', async () => {
    (DigestRepository.getUnprocessedAudits as any).mockResolvedValue([]);
    await (DigestService as any).generateDigestForUser(dummyUser.id, dummyOrg.id);
    
    // No LLM calls, no Fallback calls
    expect(fetchMock).not.toHaveBeenCalled();
    expect(DigestRepository.create).not.toHaveBeenCalled();
  });

  it('Output format preserved and retries once on 500 error', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, statusText: 'Internal Server Error' })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: 'Recovered Summary' } }] }) });

    const provider = new LlmProvider('test_key');
    const result = await provider.generateSummary([dummyEvents[0]], dummyOrg, dummyUser);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toBe('Recovered Summary');
  });
});
