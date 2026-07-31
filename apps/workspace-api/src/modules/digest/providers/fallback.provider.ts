import { AuditLog, Org, User } from '@workspace/database';
import { DigestAIProvider } from './digest-ai.provider';

export class FallbackProvider implements DigestAIProvider {
  async generateSummary(events: AuditLog[], organization: Org, user: User): Promise<string> {
    const counts: Record<string, number> = {
      pr_reviewed: 0,
      ticket_closed: 0,
      resource_shared: 0,
    };

    for (const audit of events) {
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

    return summaryParts.length > 0 
      ? summaryParts.join(' ')
      : `${events.length} new activities recorded.`;
  }
}
