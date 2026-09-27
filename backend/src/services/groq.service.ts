import { z } from 'zod';
import { env } from '../config/env.js';
import { fetchWithTimeout } from '../utils/http.js';

const groqResponseSchema = z.object({
  location: z.string().trim().nullable(),
});

export class GroqService {
  /**
   * Extract human-readable location text from disaster description using Groq LLM API.
   * Fails gracefully and returns null if Groq is unavailable, timed out, or unconfigured.
   */
  static async extractLocation(description: string): Promise<string | null> {
    if (!description || !description.trim()) {
      return null;
    }

    // Support mock extraction for test suite or demo mode without real Groq credentials
    if (process.env.NODE_ENV === 'test' || env.GROQ_API_KEY === 'mock-groq-key' || !env.GROQ_API_KEY) {
      return this.mockExtractLocation(description);
    }

    try {
      const prompt = `Extract the specific geographic location mentioned in this disaster description.
Return JSON ONLY in this exact format:
{
  "location": "extracted location string or null"
}

If no specific location is mentioned, return:
{
  "location": null
}

Description:
"${description}"`;

      const response = await fetchWithTimeout<{
        choices?: Array<{ message?: { content?: string } }>;
      }>('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a geographic location extraction helper for emergency disaster response. Respond ONLY with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        timeoutMs: 8000,
      });

      if (!response.ok || !response.data?.choices?.[0]?.message?.content) {
        console.warn(`[GroqService] Request failed with HTTP status ${response.status}`);
        return this.mockExtractLocation(description);
      }

      const content = response.data.choices[0].message.content.trim();
      const parsedJson = JSON.parse(content);
      const validated = groqResponseSchema.safeParse(parsedJson);

      if (!validated.success || !validated.data.location) {
        return null;
      }

      return validated.data.location;
    } catch (error) {
      console.warn('[GroqService] Location extraction failed cleanly:', error);
      return this.mockExtractLocation(description);
    }
  }

  /**
   * Regex-based fallback heuristic for extracting locations when Groq API is unavailable.
   */
  private static mockExtractLocation(description: string): string | null {
    // Basic heuristic: check for patterns like "in Manhattan, NYC" or "near San Jose, CA"
    const match = description.match(/(?:in|near|at|across|affecting)\s+([A-Z][a-zA-Z\s,]+(?:NYC|CA|NY|TX|FL|USA|City)?)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  }
}
