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
    <section className="py-20 px-4 bg-zinc-900/50">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">Comment ça marche</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Analysez votre marque en 3 étapes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="text-6xl font-display text-primary/40 font-bold mb-4 tabular-nums">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-balance">{step.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{step.description}</p>
            </div>
          ))}

          {CONNECTORS.map((pos, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="hidden md:block absolute top-8 border-t-2 border-dashed border-zinc-700"
              style={{ left: pos.left, right: pos.right }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
