/**
 * Threat level for prompt analysis.
 */
export enum ThreatLevel {
  NONE = 'none',
  LOW = 'low', // Sanitize and continue
  HIGH = 'high', // Block completely
}

/**
 * Result of prompt analysis.
 */
export interface PromptAnalysisResult {
  level: ThreatLevel;
  sanitized: string;
  matchedPatterns: string[];
}

/**
 * Service to sanitize user prompts before sending to LLMs.
 * Prevents prompt injection attacks while preserving legitimate queries.
 */
export class PromptSanitizerService {
  /**
   * HIGH severity patterns - these will block the prompt entirely.
   * Includes jailbreak attempts, system prompt extraction, and role manipulation.
   */
  private static readonly HIGH_THREAT_PATTERNS: Array<{
    pattern: RegExp;
    name: string;
  }> = [
    // Jailbreak attempts
    {
      pattern: /\bdan\s+mode\b/i,
      name: 'jailbreak_dan_mode',
    },
    {
      pattern: /\bdeveloper\s+mode\b/i,
      name: 'jailbreak_developer_mode',
    },
    {
      pattern: /\bjailbreak\b/i,
      name: 'jailbreak_explicit',
    },
    // System prompt extraction
    {
      pattern: /what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions?|rules?)/i,
      name: 'extraction_system_prompt',
    },
    {
      pattern: /show\s+(me\s+)?(your\s+)?(system\s+)?(prompt|instructions?)/i,
      name: 'extraction_show_prompt',
    },
    {
      pattern: /reveal\s+(your\s+)?(system|hidden|secret)/i,
      name: 'extraction_reveal',
    },
    {
      pattern: /print\s+(your\s+)?(system|instructions?|prompt)/i,
      name: 'extraction_print',
    },
    // Role manipulation
    {
      pattern: /you\s+are\s+now\s+(a|an|the)/i,
      name: 'role_manipulation_now',
    },
    {
      pattern: /act\s+as\s+(if\s+)?(you\s+)?(are|were)/i,
      name: 'role_manipulation_act',
    },
    {
      pattern: /pretend\s+(to\s+be|you\s+are)/i,
      name: 'role_manipulation_pretend',
    },
    {
      pattern: /roleplay\s+as/i,
      name: 'role_manipulation_roleplay',
    },
    // Direct instruction overrides
    {
      pattern: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/i,
      name: 'override_ignore',
    },
    {
      pattern: /disregard\s+(all\s+)?(previous|above|prior)/i,
      name: 'override_disregard',
    },
    {
      pattern: /forget\s+(everything|all|your)\s+(instructions?|rules?|training)/i,
      name: 'override_forget',
    },
  ];

  /**
   * LOW severity patterns - these will be sanitized but the prompt continues.
   * Includes delimiter injections and ambiguous formulations.
   */
  private static readonly LOW_THREAT_PATTERNS: Array<{
    pattern: RegExp;
    name: string;
    replacement: string;
  }> = [
    {
      pattern: /```system/gi,
      name: 'delimiter_system_block',
      replacement: '',
    },
    {
      pattern: /\[system\]/gi,
      name: 'delimiter_system_bracket',
      replacement: '',
    },
    {
      pattern: /<\/?system>/gi,
      name: 'delimiter_system_tag',
      replacement: '',
    },
    {
      pattern: /```/g,
      name: 'delimiter_code_block',
      replacement: '',
    },
    {
      pattern: /\[INST\]/gi,
      name: 'delimiter_inst_open',
      replacement: '',
    },
    {
      pattern: /\[\/INST\]/gi,
      name: 'delimiter_inst_close',
      replacement: '',
    },
    {
      pattern: /<\|[^|]*\|>/g,
      name: 'delimiter_special_token',
      replacement: '',
    },
  ];

  /**
   * Maximum allowed prompt length to prevent resource exhaustion.
   */
  private static readonly MAX_PROMPT_LENGTH = 500;

  /**
   * Analyzes a prompt and returns its threat level, sanitized version,
   * and list of matched patterns.
   */
  static analyze(prompt: string): PromptAnalysisResult {
    const matchedPatterns: string[] = [];

    // Trim and limit length
    let sanitized = prompt.trim().slice(0, this.MAX_PROMPT_LENGTH);

    // Check for HIGH threat patterns first
    for (const { pattern, name } of this.HIGH_THREAT_PATTERNS) {
      if (pattern.test(sanitized)) {
        matchedPatterns.push(name);
      }
    }

    // If any HIGH threat pattern matched, return immediately
    if (matchedPatterns.length > 0) {
      return {
        level: ThreatLevel.HIGH,
        sanitized: '', // Don't provide sanitized version for HIGH threats
        matchedPatterns,
      };
    }

    // Check and apply LOW threat patterns
    for (const { pattern, name, replacement } of this.LOW_THREAT_PATTERNS) {
      if (pattern.test(sanitized)) {
        matchedPatterns.push(name);
        sanitized = sanitized.replace(pattern, replacement);
      }
    }

    // Determine final threat level
    const level = matchedPatterns.length > 0 ? ThreatLevel.LOW : ThreatLevel.NONE;

    return {
      level,
      sanitized: sanitized.trim(),
      matchedPatterns,
    };
  }
}
