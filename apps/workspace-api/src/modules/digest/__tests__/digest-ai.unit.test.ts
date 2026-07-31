import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiProvider } from '../providers/gemini.provider';
import { FallbackProvider } from '../providers/fallback.provider';
import { AuditLog, Org, User } from '@workspace/database';

// Mock global fetch for GeminiProvider
global.fetch = vi.fn();

describe('Digest AI Integration Unit Tests', () => {
  const mockOrg = { id: 'org-1', name: 'Organization Alpha' } as Org;
  const mockUser = { id: 'user-1', email: 'user@test.com' } as User;
  const mockEvents = [
    { id: '1', action: 'REVIEW_PR', entityType: 'PULL_REQUEST', metadata: {} },
    { id: '2', action: 'UPDATE_TICKET', entityType: 'TICKET', metadata: { status: 'CLOSED' } }
  ] as unknown as AuditLog[];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('FallbackProvider', () => {
    it('generates a deterministic summary based on events', async () => {
      const provider = new FallbackProvider();
      const summary = await provider.generateSummary(mockEvents, mockOrg, mockUser);
      expect(summary).toContain('1 Pull Requests reviewed');
      expect(summary).toContain('1 Tickets closed');
    });

    it('handles empty events gracefully', async () => {
      const provider = new FallbackProvider();
      const summary = await provider.generateSummary([], mockOrg, mockUser);
      expect(summary).toBe('0 new activities recorded.');
    });
  });

  describe('GeminiProvider', () => {
    it('generates summary successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'AI Summary for Organization Alpha' }] } }]
        })
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const provider = new GeminiProvider('fake-api-key');
      const summary = await provider.generateSummary(mockEvents, mockOrg, mockUser);

      expect(summary).toBe('AI Summary for Organization Alpha');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      const fetchArgs = (global.fetch as any).mock.calls[0];
      const fetchBody = JSON.parse(fetchArgs[1].body);
      const prompt = fetchBody.contents[0].parts[0].text;
      
      // Verify prompt construction
      expect(prompt).toContain('Organization Alpha');
      expect(prompt).toContain('user@test.com');
      expect(prompt).toContain('REVIEW_PR');
    });

    it('throws error on missing API key by default logic (if implemented) or throws network error', async () => {
      // In our code, missing API key throws 4xx from Google, let's simulate that
      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized'
      };
      (global.fetch as any).mockResolvedValue(mockResponse);

      const provider = new GeminiProvider('invalid-key');
      await expect(provider.generateSummary(mockEvents, mockOrg, mockUser)).rejects.toThrow('Gemini API error: Unauthorized');
    });

    it('throws error on timeout', async () => {
      (global.fetch as any).mockRejectedValue(new Error('AbortError: The operation was aborted'));

      const provider = new GeminiProvider('fake-api-key');
      await expect(provider.generateSummary(mockEvents, mockOrg, mockUser)).rejects.toThrow('AbortError');
    });
  });
});
