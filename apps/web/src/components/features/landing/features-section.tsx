import { BarChart3, Heart, Layers, Lightbulb, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Feature {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  engines?: readonly string[];
}

const AI_ENGINES = ['ChatGPT', 'Claude', 'Gemini bientôt'] as const;

const FEATURES: Feature[] = [
  {
    number: '01',
    badge: 'CORE',
    icon: Layers,
    title: 'Surveillance multi-moteurs',
    description:
      'Surveillez votre marque sur ChatGPT, Claude, et bientôt Gemini. Détectez automatiquement si les moteurs de recherche IA recommandent votre marque ou vos concurrents.',
    engines: AI_ENGINES,
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'Part de voix IA',
    description:
      'Mesurez votre part de visibilité par rapport à vos concurrents dans les réponses générées.',
  },
  {
    number: '03',
    icon: Heart,
    title: 'Analyse du sentiment',
    description:
      "Comprenez comment l'IA perçoit et présente votre marque : positive, neutre ou négative.",
  },
  {
    number: '04',
    icon: Lightbulb,
    title: 'Recommandations',
    description:
      'Recevez des actions concrètes pour améliorer votre visibilité dans les réponses IA.',
  },
  {
    number: '05',
    icon: TrendingUp,
    title: 'Historique & tendances',
    description:
      "Suivez l'évolution de votre score de visibilité et identifiez les tendances sur la durée.",
  },
];

function FeatureIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
      <Icon className="size-6 text-primary" aria-hidden="true" />
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <Badge variant="mono" className="text-xs">
          [{feature.number}] {feature.badge || ''}
        </Badge>
      </div>
      <FeatureIcon icon={feature.icon} />
      <h3 className="font-display text-2xl mb-3 mt-4 text-balance">{feature.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed text-pretty flex-grow">
        {feature.description}
      </p>
      {feature.engines ? (
        <div className="flex flex-wrap gap-2 mt-6">
          {feature.engines.map((engine) => (
            <span
              key={engine}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                engine.includes('bientôt')
                  ? 'border-warning/30 bg-warning/10 text-warning'
                  : 'border-border bg-card text-muted-foreground'
              }`}
            >
              {engine}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-4 scroll-mt-20 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="mono" className="mb-6">
            Fonctionnalités
          </Badge>
          <h2 className="font-display text-4xl mb-6 text-balance md:text-5xl">
            Tout ce qu&apos;il faut pour surveiller votre visibilité IA
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Coucou IA vous donne les outils pour comprendre et améliorer votre présence dans les
            réponses des intelligences artificielles.
          </p>
        </div>

        {/* Bento grid layout - asymmetric */}
        <div className="grid grid-cols-12 gap-6">
          {/* Large feature - Main one */}
          <Card className="col-span-12 md:col-span-8 border-l-4 border-primary p-8 hover:border-primary/80 transition-colors group">
            <FeatureCard feature={FEATURES[0]} />
          </Card>

          {/* Smaller features - Right column, stacked */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            <Card className="p-6 hover:bg-card-hover transition-colors group">
              <FeatureCard feature={FEATURES[1]} />
            </Card>
            <Card className="p-6 hover:bg-card-hover transition-colors group">
              <FeatureCard feature={FEATURES[2]} />
            </Card>
          </div>

          {/* Bottom row - Two features */}
          <Card className="col-span-12 md:col-span-6 p-8 hover:bg-card-hover transition-colors group">
            <FeatureCard feature={FEATURES[3]} />
          </Card>
          <Card className="col-span-12 md:col-span-6 p-8 hover:bg-card-hover transition-colors group">
            <FeatureCard feature={FEATURES[4]} />
          </Card>
        </div>
      </div>
    </section>
  );
}
