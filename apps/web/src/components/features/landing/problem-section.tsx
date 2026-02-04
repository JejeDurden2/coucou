'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Stat {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  source: string;
}

const STATS: Stat[] = [
  {
    value: 67,
    prefix: '',
    suffix: '%',
    label: 'font confiance aux recommandations IA',
    source: 'Études 2024-2025',
  },
  {
    value: 25,
    prefix: '-',
    suffix: '%',
    label: 'de recherches Google depuis ChatGPT',
    source: 'Gartner 2024',
  },
  {
    value: 40,
    prefix: '+',
    suffix: '%',
    label: 'de conversions si cité en premier',
    source: 'Seer Interactive 2025',
  },
];

const STAT_TARGETS = STATS.map((s) => s.value);
const ANIMATION_DURATION = 1500;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function useCountUp(targets: number[], trigger: boolean): number[] {
  const [values, setValues] = useState<number[]>(() => targets.map(() => 0));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;

    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const eased = easeOutQuart(progress);

      setValues(targets.map((target) => Math.round(eased * target)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [trigger, targets]);

  return values;
}

export function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const displayValues = useCountUp(STAT_TARGETS, isVisible);

  return (
    <section ref={sectionRef} className="py-16 px-4 bg-zinc-900/50 md:py-20">
      <div className="container mx-auto max-w-4xl">
        <Badge variant="mono" className="mb-8">
          [Le Problème]
        </Badge>

        <h2 className="font-display text-4xl leading-tight mb-8 text-balance md:text-5xl lg:text-6xl">
          <span className="font-mono text-secondary-accent">67%</span> des consommateurs font
          confiance aux recommandations IA.
        </h2>

        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-12">
          Pendant que vous lisez ceci, des prospects demandent à ChatGPT de recommander un produit
          comme le vôtre. Êtes-vous mentionné ? Ou est-ce votre concurrent qui décroche la vente ?
        </p>

        {/* Technical grid for stats */}
        <div className="grid md:grid-cols-3 gap-px bg-border">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="bg-card p-8">
              <p className="font-mono text-4xl tabular-nums text-secondary-accent mb-3">
                {stat.prefix}
                {displayValues[i]}
                {stat.suffix}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">{stat.label}</p>
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
                {stat.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
