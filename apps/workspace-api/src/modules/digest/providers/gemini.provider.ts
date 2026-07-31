import { AuditLog, Org, User } from '@workspace/database';
import { DigestAIProvider } from './digest-ai.provider';

export class GeminiProvider implements DigestAIProvider {
  private apiKey: string;
  private model: string;
  private url: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
    this.url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  async generateSummary(events: AuditLog[], organization: Org, user: User): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `You are an engineering project assistant.
Summarize today's activity for ${organization.name}.
Use concise professional language.
Mention completed pull requests, ticket activity, reviews, feature flags, and important actions.
Never invent information.
Never mention other organizations.

Current Date: ${today}
User: ${user.email}

Audit Events:
${JSON.stringify(events.map(a => ({ action: a.action, type: a.entityType, metadata: a.metadata })), null, 2)}

Generate a short executive summary.`.trim();

    // Use AbortController for timeout to prevent hanging the scheduler
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`${this.url}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 150,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
