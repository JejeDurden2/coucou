import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { GlossaryTermMeta } from '@/lib/glossary';

interface TermCardProps {
  term: GlossaryTermMeta;
}

export function TermCard({ term }: TermCardProps): React.ReactNode {
  return (
    <article className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <Link href={`/lexique/${term.slug}`} className="block space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-balance font-semibold text-foreground group-hover:text-primary transition-colors">
            {term.term}
            {term.termEn && term.termEn !== term.term && (
              <span className="text-muted-foreground font-normal text-sm ml-1.5">
                ({term.termEn})
              </span>
            )}
          </h3>
          <ArrowRight
            className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5"
            aria-hidden="true"
          />
        </div>

        <p className="text-pretty text-sm text-muted-foreground line-clamp-2">{term.definition}</p>
      </Link>
    </article>
  );
}
