'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Stat {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  source: string;
  color: string;
  textColor: string;
}

const STATS: Stat[] = [
  {
    value: 67,
    prefix: '',
    suffix: '%',
    label: 'font confiance aux recommandations IA',
    source: 'Études 2024-2025',
    color: 'bg-red-500/[0.03] border-red-500/[0.08]',
    textColor: 'text-red-500',
  },
  {
    value: 25,
    prefix: '-',
    suffix: '%',
    label: 'de recherches Google depuis ChatGPT',
    source: 'Gartner 2024',
    color: 'bg-amber-500/[0.03] border-amber-500/[0.08]',
    textColor: 'text-amber-400',
  },
  {
    value: 40,
    prefix: '+',
    suffix: '%',
    label: 'de conversions si cité en premier',
    source: 'Seer Interactive 2025',
    color: 'bg-primary/[0.03] border-primary/[0.08]',
    textColor: 'text-primary',
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

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0]?.isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.3,
    });

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, [handleIntersect]);

  const displayValues = useCountUp(STAT_TARGETS, isVisible);

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-zinc-900/50">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Pourquoi le GEO devient incontournable
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Les décisions d&apos;achat passent de plus en plus par l&apos;IA. Sans visibilité, vous
            perdez des clients sans le savoir.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-lg border p-6 backdrop-blur-sm ${stat.color}`}
            >
              <div
                className={`font-display text-4xl font-bold tabular-nums mb-2 ${stat.textColor}`}
              >
                {stat.prefix}
                {displayValues[i]}
                {stat.suffix}
              </div>
              <p className="text-sm text-muted-foreground text-pretty">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-2">{stat.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
