export interface MentionResult {
  isCited: boolean;
  citationContext: string | null;
  position: number | null;
}

export class MentionDetectionService {
  private static readonly CONTEXT_CHARS = 50;

  static detectMention(
    response: string,
    brandName: string,
    brandVariants: string[],
  ): MentionResult {
    const allTerms = [brandName, ...brandVariants];
    const responseLower = response.toLowerCase();

    for (const term of allTerms) {
      const termLower = term.toLowerCase();
      const index = responseLower.indexOf(termLower);

      if (index !== -1) {
        return {
          isCited: true,
          citationContext: this.extractContext(response, index, term.length),
          position: this.detectPosition(response, index),
        };
      }
    }

    return {
      isCited: false,
      citationContext: null,
      position: null,
    };
  }

  private static extractContext(
    response: string,
    matchIndex: number,
    matchLength: number,
  ): string {
    const start = Math.max(0, matchIndex - this.CONTEXT_CHARS);
    const end = Math.min(
      response.length,
      matchIndex + matchLength + this.CONTEXT_CHARS,
    );

    let context = response.slice(start, end);

    if (start > 0) {
      context = '...' + context;
    }
    if (end < response.length) {
      context = context + '...';
    }

    return context.replace(/\n/g, ' ').trim();
  }

  private static detectPosition(response: string, matchIndex: number): number | null {
    const textBefore = response.slice(0, matchIndex);
    const lines = textBefore.split('\n');

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();

      // Match patterns like "1.", "1)", "1:", "#1", "- 1."
      const numberMatch = line.match(/^(?:#?\s*)?(\d+)[.):\s]/);
      if (numberMatch) {
        return parseInt(numberMatch[1], 10);
      }

      // Match ordinal patterns like "Premier", "Deuxième", "1er", "2e"
      const ordinalPatterns: [RegExp, number][] = [
        [/^(?:1er|premier|première)/i, 1],
        [/^(?:2e|2ème|deuxième|second|seconde)/i, 2],
        [/^(?:3e|3ème|troisième)/i, 3],
        [/^(?:4e|4ème|quatrième)/i, 4],
        [/^(?:5e|5ème|cinquième)/i, 5],
      ];

      for (const [pattern, position] of ordinalPatterns) {
        if (pattern.test(line)) {
          return position;
        }
      }
    }

    return null;
  }
}
