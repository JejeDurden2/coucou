import { BarChart3, Heart, Layers, Lightbulb, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  wide: boolean;
}

const LLM_PROVIDERS = ['ChatGPT', 'Claude'];

const FEATURES: Feature[] = [
  {
    icon: Layers,
    title: 'Surveillance multi-LLM',
    description:
      "Analysez vos mentions sur ChatGPT et Claude en un seul dashboard. Détectez automatiquement si l'IA recommande votre marque ou vos concurrents.",
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
              className={`group rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:border-primary/30 transition-colors ${feature.wide ? 'md:col-span-2' : ''}`}
            >
              {feature.wide ? (
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div>
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="size-6 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-balance">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap md:flex-col gap-2 md:shrink-0">
                    {LLM_PROVIDERS.map((provider) => (
                      <span
                        key={provider}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        {provider}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="size-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-balance">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{feature.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
