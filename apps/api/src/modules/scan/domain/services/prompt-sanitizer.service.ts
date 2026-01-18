/**
 * Service to sanitize user prompts before sending to LLMs.
 * Prevents prompt injection attacks while preserving legitimate queries.
 */
export class PromptSanitizerService {
  /**
   * Dangerous patterns that could be used for prompt injection.
   * These patterns attempt to override system instructions or extract sensitive info.
   */
  private static readonly DANGEROUS_PATTERNS = [
    // Direct instruction overrides
    /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/i,
    /disregard\s+(all\s+)?(previous|above|prior)/i,
    /forget\s+(everything|all|your)\s+(instructions?|rules?|training)/i,
    // System prompt extraction
    /what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions?|rules?)/i,
    /show\s+(me\s+)?(your\s+)?(system\s+)?(prompt|instructions?)/i,
    /reveal\s+(your\s+)?(system|hidden|secret)/i,
    /print\s+(your\s+)?(system|instructions?|prompt)/i,
    // Role manipulation
    /you\s+are\s+now\s+(a|an|the)/i,
    /act\s+as\s+(if\s+)?(you\s+)?(are|were)/i,
    /pretend\s+(to\s+be|you\s+are)/i,
    /roleplay\s+as/i,
    // Jailbreak attempts
    /\bdan\s+mode\b/i,
    /\bdeveloper\s+mode\b/i,
    /\bjailbreak\b/i,
    // Delimiter injection
    /```system/i,
    /\[system\]/i,
    /<\/?system>/i,
  ];

  /**
   * Maximum allowed prompt length to prevent resource exhaustion.
   */
  private static readonly MAX_PROMPT_LENGTH = 500;

  /**
   * Sanitizes a user prompt by detecting and neutralizing injection attempts.
   * Returns a safe version of the prompt or throws if the prompt is malicious.
   */
  static sanitize(prompt: string): string {
    // Trim and limit length
    let sanitized = prompt.trim().slice(0, this.MAX_PROMPT_LENGTH);

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        // Replace the dangerous content with a safe placeholder
        sanitized = sanitized.replace(pattern, '[contenu filtré]');
      }
    }

    // Remove potential delimiter injections
    sanitized = sanitized
      .replace(/```/g, '')
      .replace(/\[INST\]/gi, '')
      .replace(/\[\/INST\]/gi, '')
      .replace(/<\|[^|]*\|>/g, '');

    return sanitized;
  }

  /**
   * Checks if a prompt contains potentially dangerous content.
   * Use this for logging/monitoring purposes.
   */
  static containsDangerousContent(prompt: string): boolean {
    return this.DANGEROUS_PATTERNS.some((pattern) => pattern.test(prompt));
  }
}
