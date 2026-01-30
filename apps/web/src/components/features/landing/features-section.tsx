import { BarChart3, Heart, Layers, Lightbulb, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  wide: boolean;
}

const AI_ENGINES = ['ChatGPT', 'Claude', 'Gemini bientôt'] as const;

const FEATURES: Feature[] = [
  {
    icon: Layers,
    title: 'Surveillance multi-moteurs',
    description:
      'Surveillez votre marque sur ChatGPT, Claude, et bientôt Gemini. Détectez automatiquement si les moteurs de recherche IA recommandent votre marque ou vos concurrents.',
    wide: true,
  },
  {
    icon: BarChart3,
    title: 'Part de voix IA',
    description:
      'Mesurez votre part de visibilité par rapport à vos concurrents dans les réponses générées.',
    wide: false,
  },
  {
    icon: Heart,
    title: 'Analyse sentiment',
    description:
      "Comprenez comment l'IA perçoit et présente votre marque : positive, neutre ou négative.",
    wide: false,
  },
  {
    icon: Lightbulb,
    title: 'Recommandations',
    description:
      'Recevez des actions concrètes pour améliorer votre visibilité dans les réponses IA.',
    wide: false,
  },
  {
    icon: TrendingUp,
    title: 'Historique & tendances',
    description:
      "Suivez l'évolution de votre score de visibilité et identifiez les tendances sur la durée.",
    wide: false,
  },
];

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
      <Icon className="size-6 text-primary" aria-hidden="true" />
    </div>
  );
}

function FeatureContent({ feature }: { feature: Feature }) {
  return (
    <>
      <FeatureIcon icon={feature.icon} />
      <h3 className="text-lg font-semibold mb-2 text-balance">{feature.title}</h3>
      <p className="text-sm text-muted-foreground text-pretty">{feature.description}</p>
    </>
  );
}

function WideFeatureContent({ feature }: { feature: Feature }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
      <div>
        <FeatureContent feature={feature} />
      </div>
      <div className="flex flex-wrap md:flex-col gap-2 md:shrink-0">
        {AI_ENGINES.map((engine) => (
          <span
            key={engine}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
              engine.includes('bientôt')
                ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
                : 'border-white/10 bg-white/5 text-muted-foreground'
            }`}
          >
            {engine}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">Fonctionnalités</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Tout ce qu&apos;il faut pour surveiller votre visibilité IA
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Coucou IA vous donne les outils pour comprendre et améliorer votre présence dans les
            réponses des intelligences artificielles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                'group rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:border-primary/30 transition-colors',
                feature.wide && 'md:col-span-2',
              )}
            >
              {feature.wide ? (
                <WideFeatureContent feature={feature} />
              ) : (
                <FeatureContent feature={feature} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
