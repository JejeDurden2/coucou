import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { PersonaMeta } from '@/lib/geo-pour';

interface PersonaCardProps {
  persona: PersonaMeta;
}

export function PersonaCard({ persona }: PersonaCardProps): React.ReactNode {
  return (
    <article className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <Link href={`/geo-pour/${persona.slug}`} className="block space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-balance font-semibold text-foreground group-hover:text-primary transition-colors">
            {persona.persona}
          </h3>
          <ArrowRight
            className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5"
            aria-hidden="true"
          />
        </div>

        {persona.benefits.length > 0 && (
          <p className="text-pretty text-sm text-muted-foreground line-clamp-2">
            {persona.benefits[0]}
          </p>
        )}
      </Link>
    </article>
  );
}
