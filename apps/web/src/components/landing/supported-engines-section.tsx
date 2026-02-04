import Image from 'next/image';
import type { ReactNode } from 'react';

import { Check, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type EngineStatus = 'active' | 'coming';

interface Engine {
  name: string;
  logo: string;
  status: EngineStatus;
}

const ENGINES: Engine[] = [
  { name: 'ChatGPT', logo: '/logos/chatgpt.svg', status: 'active' },
  { name: 'Claude', logo: '/logos/claude.svg', status: 'active' },
  { name: 'Gemini', logo: '/logos/gemini.svg', status: 'coming' },
];

interface EngineCardProps {
  engine: Engine;
}

function EngineCard({ engine }: EngineCardProps): ReactNode {
  const isActive = engine.status === 'active';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-4 p-8 border transition-colors',
        isActive
          ? 'border-border bg-card hover:bg-card-hover'
          : 'border-dashed border-border bg-card/50',
      )}
    >
      <div
        className={cn(
          'relative size-16 rounded-xl flex items-center justify-center',
          !isActive && 'opacity-50',
        )}
      >
        <Image
          src={engine.logo}
          alt={`Logo ${engine.name}`}
          width={48}
          height={48}
          className="size-12"
        />
      </div>

      <div className="text-center">
        <p className={cn('font-medium mb-1', !isActive && 'text-muted-foreground')}>
          {engine.name}
        </p>
        <EngineStatusBadge status={engine.status} />
      </div>
    </div>
  );
}

interface EngineStatusBadgeProps {
  status: EngineStatus;
}

function EngineStatusBadge({ status }: EngineStatusBadgeProps): ReactNode {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 font-sans text-xs text-success uppercase tracking-wide">
        <Check className="size-3" aria-hidden="true" />
        Disponible
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-sans text-xs text-warning uppercase tracking-wide">
      <Clock className="size-3" aria-hidden="true" />
      Bientôt
    </span>
  );
}

export function SupportedEnginesSection(): ReactNode {
  return (
    <section className="py-16 px-4 md:py-20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="mono" className="mb-6">
            Compatibilité
          </Badge>
          <h2 className="font-display text-3xl mb-4 text-balance md:text-4xl">
            Moteurs de recherche IA supportés
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-pretty leading-relaxed">
            Surveillez votre visibilité sur les principaux moteurs de recherche IA du marché.
          </p>
        </div>

        {/* Technical grid with gap-px */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border max-w-2xl mx-auto">
          {ENGINES.map((engine) => (
            <EngineCard key={engine.name} engine={engine} />
          ))}
        </div>
      </div>
    </section>
  );
}
