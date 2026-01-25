// GEO (Generative Engine Optimization) Glossary
// Centralized definitions for tooltip explanations

export const GEO_GLOSSARY = {
  scan: {
    label: 'Analyse',
    definition: 'Interrogation des moteurs IA pour vérifier si votre marque est mentionnée',
  },
  citationRate: {
    label: 'Part de voix IA',
    definition: 'Pourcentage de requêtes où votre marque est mentionnée par les IA',
  },
  position: {
    label: 'Position',
    definition: 'Votre rang dans la réponse IA (1 = cité en premier)',
  },
  prompt: {
    label: 'Requête surveillée',
    definition: 'Question type que vos clients poseraient à une IA',
  },
  sentiment: {
    label: 'Sentiment IA',
    definition: 'Perception et ton des IA envers votre marque',
  },
  competitor: {
    label: 'Concurrent',
    definition: 'Marque concurrente détectée dans les réponses IA',
  },
  recommendation: {
    label: 'Recommandation',
    definition: 'Action suggérée pour améliorer votre visibilité IA',
  },
  globalScore: {
    label: 'Score de visibilité',
    definition: 'Score 0-100 mesurant votre visibilité globale dans les moteurs IA',
  },
  aiSearch: {
    label: 'Recherche IA',
    definition: "Recherche d'information via des IA conversationnelles (ChatGPT, Claude, Gemini)",
  },
  brandMention: {
    label: 'Mention de marque',
    definition: 'Citation de votre marque dans une réponse IA',
  },
  shareOfVoice: {
    label: 'Part de voix',
    definition: 'Part des requêtes où vous êtes mentionné vs vos concurrents',
  },
} as const;

export type GlossaryTerm = keyof typeof GEO_GLOSSARY;
export type GlossaryEntry = { label: string; definition: string };
