import { AuditLog, Org, User } from '@workspace/database';

export interface DigestAIProvider {
  generateSummary(events: AuditLog[], organization: Org, user: User): Promise<string>;
}
