import { memo } from 'react';
import { AlertTriangle, Target, Lightbulb, TrendingDown } from 'lucide-react';

const SAMPLE_RECOMMENDATIONS = [
  {
    icon: AlertTriangle,
    severity: 'bg-destructive/10 text-destructive',
    title: 'Faible taux de citation sur GPT-4o',
    description: 'Votre marque est rarement citée dans les réponses GPT-4o. Améliorez…',
  },
  {
    icon: Target,
    severity: 'bg-warning/10 text-warning',
    title: 'Concurrent X domine sur "meilleur outil"',
    description: 'Le concurrent X est cité 3x plus souvent que vous sur ce prompt…',
  },
  {
    icon: Lightbulb,
    severity: 'bg-primary/10 text-primary',
    title: 'Opportunité de contenu détectée',
    description: "Les IA ne trouvent pas d'information sur votre tarification…",
  },
  {
    icon: TrendingDown,
    severity: 'bg-warning/10 text-warning',
    title: 'Position en baisse sur Claude',
    description: 'Votre position moyenne a reculé de 2 places cette semaine…',
  },
];

export const RecommendationsPreview = memo(function RecommendationsPreview() {
  return (
    <div className="space-y-3 p-4">
      {SAMPLE_RECOMMENDATIONS.map((rec) => {
        const Icon = rec.icon;
        return (
          <div key={rec.title} className="rounded-lg border border-border bg-card p-4 flex gap-3">
            <div
              className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${rec.severity}`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-pretty">{rec.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 text-pretty">{rec.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
