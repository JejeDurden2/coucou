import { Badge } from '@/components/ui/badge';

const STEPS = [
  {
    number: '01',
    title: 'Créez votre projet',
    description: 'Entrez le nom de votre marque et votre site web.',
  },
  {
    number: '02',
    title: "Lancez l'analyse",
    description: 'Nos algorithmes interrogent ChatGPT et Claude pour vous.',
  },
  {
    number: '03',
    title: 'Consultez vos résultats',
    description: 'Découvrez votre part de voix, vos concurrents et des recommandations.',
  },
];

const CONNECTORS = [
  { left: 'calc(16.666% + 3rem)', right: 'calc(50% + 3rem)' },
  { left: 'calc(50% + 3rem)', right: 'calc(16.666% + 3rem)' },
] as const;

export function HowItWorksSection() {
  return (
    <section className="py-16 px-4 bg-zinc-900/50 md:py-20">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <Badge variant="mono" className="mb-6">
            Comment ça marche
          </Badge>
          <h2 className="font-display text-4xl mb-4 text-balance md:text-5xl">
            Analysez votre marque en 3 étapes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="font-mono text-6xl text-primary/40 font-bold mb-6 tabular-nums">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-balance">{step.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}

          {CONNECTORS.map((pos, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="hidden md:block absolute top-8 border-t-2 border-dashed border-border"
              style={{ left: pos.left, right: pos.right }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
