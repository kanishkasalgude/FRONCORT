import { AuditLog, Org, User } from '@workspace/database';
import { DigestAIProvider } from './digest-ai.provider';

export class LlmProvider implements DigestAIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini', baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl || 'https://api.openai.com/v1';
  }

  async generateSummary(events: AuditLog[], organization: Org, user: User): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    
    // Explicitly scope events to only this organization to ensure no cross-org leak
    const orgEvents = events.filter(e => e.orgId === organization.id);
    
    // Sanitize: Extract only what is necessary, stripping out any potentially sensitive fields not needed for a summary
    const sanitizedEvents = orgEvents.map(a => ({
      action: a.action,
      type: a.entityType,
      metadata: a.metadata
    }));

    const prompt = `You are an engineering project assistant.
Summarize today's activity for ${organization.name}.
Use concise professional language.
Mention completed pull requests, ticket activity, reviews, feature flags, and important actions.
Never invent information.
Never mention other organizations.

Current Date: ${today}
User: ${user.email}

Audit Events:
${JSON.stringify(sanitizedEvents, null, 2)}

Generate a short executive summary.`.trim();

    return this.executeWithRetryAndTimeout(prompt);
  }

  private async executeWithRetryAndTimeout(prompt: string): Promise<string> {
    const maxRetries = 1;
    let attempt = 0;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 150,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`LLM API error: ${response.statusText}`);
        }

        const data = (await response.json()) as any;
        return data.choices[0].message.content.trim();
      } catch (error) {
        clearTimeout(timeoutId);
        if (attempt === maxRetries) {
          throw error;
        }
        attempt++;
        // minimal backoff before retry
        await new Promise(res => setTimeout(res, 1000));
      }
    }
    throw new Error('LLM request failed after retries.');
  }
}
