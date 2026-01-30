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
        'relative flex flex-col items-center gap-4 p-6 rounded-xl border backdrop-blur-md transition-all',
        isActive
          ? 'border-white/10 bg-white/5 hover:border-primary/30'
          : 'border-dashed border-white/10 bg-white/[0.02]',
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
        <p className={cn('font-semibold mb-1', !isActive && 'text-muted-foreground')}>
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
      <span className="inline-flex items-center gap-1 text-xs text-success">
        <Check className="size-3" aria-hidden="true" />
        Disponible
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-400">
      <Clock className="size-3" aria-hidden="true" />
      Bientôt
    </span>
  );
}

export function SupportedEnginesSection(): ReactNode {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Badge className="mb-4">Compatibilité</Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-balance">
            Moteurs de recherche IA supportés
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
            Surveillez votre visibilité sur les principaux moteurs de recherche IA du marché.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {ENGINES.map((engine) => (
            <EngineCard key={engine.name} engine={engine} />
          ))}
        </div>
      </div>
    </section>
  );
}
