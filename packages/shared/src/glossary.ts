// GEO (Generative Engine Optimization) Glossary
// Centralized definitions for tooltip explanations

export const GEO_GLOSSARY = {
  scan: 'Interrogation des IA pour vérifier si votre marque est mentionnée dans leurs réponses.',
  citationRate: 'Pourcentage de scans où votre marque est citée par au moins une IA.',
  position: "Rang de votre marque dans la réponse de l'IA. 1 = cité en premier.",
  prompt:
    'Question type que vos clients poseraient à une IA pour trouver un produit/service comme le vôtre.',
  sentiment:
    'Analyse du ton des IA quand elles parlent de votre marque : positif, neutre ou négatif.',
  competitor: 'Marque concurrente détectée automatiquement dans les réponses des IA.',
  recommendation: 'Action suggérée pour améliorer votre visibilité IA.',
  globalScore: 'Score de 0 à 100 reflétant votre visibilité globale dans les réponses des IA.',
} as const;

export type GlossaryTerm = keyof typeof GEO_GLOSSARY;
