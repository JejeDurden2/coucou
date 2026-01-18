export class CompetitorExtractionService {
  private static readonly MAX_COMPETITORS = 10;

  private static readonly INTRO_PATTERNS = [
    /(?:comme|notamment|par exemple|tels? que|parmi lesquels?)\s+/gi,
    /(?:alternatives?|concurrents?|autres? options?)\s*(?:incluent|sont|:)\s*/gi,
    /(?:on trouve|il y a|citons?)\s*/gi,
  ];

  private static readonly EXCLUDE_WORDS = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'en', 'au', 'aux',
    'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'leur', 'leurs',
    'france', 'paris', 'europe', 'français', 'française',
    'qualité', 'prix', 'service', 'produit', 'marque',
    'café', 'thé', 'boisson', 'restaurant', 'boutique', 'magasin',
    'meilleur', 'meilleure', 'meilleurs', 'meilleures',
    'premier', 'première', 'deuxième', 'troisième',
  ]);

  static extractCompetitors(response: string, brandName: string): string[] {
    const competitors = new Set<string>();
    const brandLower = brandName.toLowerCase();

    // Extract from numbered list format: "1. BrandName - description" or "1. **BrandName** - description"
    const numberedMatches = response.matchAll(
      /^\d+\.\s+\*{0,2}([A-ZÀ-Ü][^\s*-]+(?:\s+[A-ZÀ-Ü][^\s*-]+)*)\*{0,2}\s*[-–:]/gm,
    );
    for (const match of numberedMatches) {
      const name = match[1].trim();
      if (this.isValidCompetitor(name, brandLower)) {
        competitors.add(name);
      }
    }

    // Extract quoted names
    const quotedMatches = response.match(/["«]([^"»]+)["»]/g);
    if (quotedMatches) {
      for (const match of quotedMatches) {
        const name = match.slice(1, -1).trim();
        if (this.isValidCompetitor(name, brandLower)) {
          competitors.add(name);
        }
      }
    }

    // Extract capitalized words/phrases that look like brand names
    const capitalizedMatches = response.match(/(?:[A-Z][a-zàâäéèêëïîôùûü]+(?:\s+[A-Z][a-zàâäéèêëïîôùûü]+)*)/g);
    if (capitalizedMatches) {
      for (const match of capitalizedMatches) {
        if (this.isValidCompetitor(match, brandLower)) {
          competitors.add(match);
        }
      }
    }

    // Extract names after intro patterns
    for (const pattern of this.INTRO_PATTERNS) {
      const regex = new RegExp(pattern.source + '([^.!?]+)', 'gi');
      let match;
      while ((match = regex.exec(response)) !== null) {
        const segment = match[1];
        const names = segment.split(/[,;]/).map((s) => s.trim());
        for (const name of names) {
          const cleanName = name.replace(/^(?:et|ou)\s+/i, '').trim();
          if (this.isValidCompetitor(cleanName, brandLower)) {
            competitors.add(cleanName);
          }
        }
      }
    }

    return Array.from(competitors).slice(0, this.MAX_COMPETITORS);
  }

  private static isValidCompetitor(name: string, brandLower: string): boolean {
    if (!name || name.length < 2 || name.length > 50) {
      return false;
    }

    const nameLower = name.toLowerCase();

    if (nameLower === brandLower || nameLower.includes(brandLower) || brandLower.includes(nameLower)) {
      return false;
    }

    if (this.EXCLUDE_WORDS.has(nameLower)) {
      return false;
    }

    // Must start with uppercase (brand names typically do)
    if (!/^[A-ZÀ-Ü]/.test(name)) {
      return false;
    }

    // Filter out common phrases that aren't brands
    if (/^(?:Le |La |Les |Un |Une |Des |Ce |Cette )/i.test(name)) {
      return false;
    }

    return true;
  }
}
