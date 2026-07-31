import { DigestRepository } from '../repositories/digest.repository';
import { DigestAIProvider } from '../providers/digest-ai.provider';
import { FallbackProvider } from '../providers/fallback.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { prisma } from '@workspace/database';

export class DigestService {
  static async generateDigests(): Promise<void> {
    try {
      const activePairs = await DigestRepository.getActiveUsersAndOrgs();

      for (const pair of activePairs) {
        try {
          await this.generateDigestForUser(pair.actorId, pair.orgId);
        } catch (err) {
          console.error(`[DigestService] Failed to generate digest for User ${pair.actorId} in Org ${pair.orgId}`, err);
        }
      }
    } catch (error) {
      console.error('[DigestService] Failed to run digest generation loop:', error);
    }
  }

  private static async generateDigestForUser(userId: string, orgId: string): Promise<void> {
    const lastDigestTime = await DigestRepository.getLastDigestTime(userId, orgId);
    const audits = await DigestRepository.getUnprocessedAudits(orgId, userId, lastDigestTime);

    if (audits.length === 0) {
      return; 
    }

    const org = await prisma.org.findUnique({ where: { id: orgId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!org || !user) {
      throw new Error('Organization or User not found');
    }

    let provider: DigestAIProvider;
    
    if (process.env.LLM_API_KEY) {
      provider = new GeminiProvider(process.env.LLM_API_KEY, process.env.LLM_MODEL);
    } else {
      provider = new FallbackProvider();
    }

    let summary = '';
    try {
      summary = await provider.generateSummary(audits, org, user);
    } catch (error) {
      console.error('[DigestService] Primary LLM provider failed, falling back to deterministic summary.', error);
      const fallback = new FallbackProvider();
      summary = await fallback.generateSummary(audits, org, user);
    }

    await DigestRepository.create(userId, orgId, summary);
  }
}
