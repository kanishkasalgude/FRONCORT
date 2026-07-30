import { DigestRepository } from '../repositories/digest.repository';

export class DigestService {
  static async generateDigests(): Promise<void> {
    try {
      const activePairs = await DigestRepository.getActiveUsersAndOrgs();

      for (const pair of activePairs) {
        try {
          await this.generateDigestForUser(pair.actorId, pair.orgId);
        } catch (err) {
          console.error(`[DigestService] Failed to generate digest for User ${pair.actorId} in Org ${pair.orgId}`, err);
          // Scheduler failure isolation: continue running for other users
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
      return; // Digest with zero new events should not be created
    }

    const counts: Record<string, number> = {
      pr_reviewed: 0,
      ticket_closed: 0,
      resource_shared: 0,
    };

    // Summarize based on action types (these strings will match what we pass into logAction)
    for (const audit of audits) {
      if (audit.action === 'REVIEW_PR' || audit.action === 'APPROVE_PR' || audit.action === 'REQUEST_CHANGES_PR') {
        counts.pr_reviewed++;
      } else if (audit.action === 'UPDATE_TICKET' && audit.metadata && (audit.metadata as any).status === 'CLOSED') {
        counts.ticket_closed++;
      } else if (audit.action === 'DELETE_TICKET') {
        counts.ticket_closed++;
      } else if (audit.action === 'SHARE_RESOURCE') {
        counts.resource_shared++;
      }
    }

    const summaryParts: string[] = [];
    if (counts.pr_reviewed > 0) summaryParts.push(`${counts.pr_reviewed} Pull Requests reviewed.`);
    if (counts.ticket_closed > 0) summaryParts.push(`${counts.ticket_closed} Tickets closed.`);
    if (counts.resource_shared > 0) summaryParts.push(`${counts.resource_shared} Resources shared.`);

    // If no meaningful summary generated from the subset we care about, use a generic fallback using total counts
    const finalSummary = summaryParts.length > 0 
      ? summaryParts.join(' ')
      : `${audits.length} new activities recorded.`;

    await DigestRepository.create(userId, orgId, finalSummary);
  }
}
