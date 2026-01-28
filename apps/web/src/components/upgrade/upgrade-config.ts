import { BarChart3, Users, Lightbulb, Brain, type LucideIcon } from 'lucide-react';

export type UpgradeFeature = 'stats' | 'competitors' | 'recommendations' | 'sentiment';

export interface UpgradeFeatureConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  hint: string;
  benefits: string[];
}

export const UPGRADE_FEATURES: Record<UpgradeFeature, UpgradeFeatureConfig> = {
  stats: {
    title: 'Statistiques historiques',
    description:
      "Visualisez l'évolution de votre visibilité IA dans le temps avec des graphiques détaillés.",
    icon: BarChart3,
    hint: 'Part de voix, position, benchmark...',
    benefits: [
      "Graphiques d'évolution de citation et position",
      'Benchmark par modèle IA',
      "Historique jusqu'à 180 jours",
      'Export des données',
    ],
  },
  competitors: {
    title: 'Analyse des concurrents',
    description:
      'Découvrez quels concurrents sont cités par les IA, leur position et leur évolution dans le temps.',
    icon: Users,
    hint: 'Tendances, positions par modèle, keywords...',
    benefits: [
      'Concurrents cités par les IA identifiés',
      'Comparaison de votre position vs concurrents',
      "Tendances d'évolution par modèle",
      'Keywords associés à chaque concurrent',
    ],
  },
  recommendations: {
    title: 'Recommandations actionnables',
    description:
      'Obtenez des conseils personnalisés et actionnables pour améliorer votre visibilité dans les réponses IA.',
    icon: Lightbulb,
    hint: 'Analyses, actions prioritaires, suivi...',
    benefits: [
      'Actions concrètes pour améliorer vos citations',
      'Priorisation par impact',
      'Suivi des progrès',
      'Adaptées à votre secteur',
    ],
  },
  sentiment: {
    title: 'Analyse sentiment',
    description:
      "Découvrez comment les IA perçoivent votre marque : thèmes associés, points positifs et axes d'amélioration.",
    icon: Brain,
    hint: 'Analyse GPT + Claude chaque semaine',
    benefits: [
      'Score sentiment global par IA',
      'Thèmes et mots-clés associés à votre marque',
      "Points positifs et axes d'amélioration",
      'Évolution dans le temps',
    ],
  },
};
