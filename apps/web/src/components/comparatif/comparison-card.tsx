import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { ComparisonMeta } from '@/lib/comparatif';

interface ComparisonCardProps {
  comparison: ComparisonMeta;
}

export function ComparisonCard({ comparison }: ComparisonCardProps): React.ReactNode {
  return (
    <article className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <Link href={`/comparatif/${comparison.slug}`} className="block space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-balance font-semibold text-foreground group-hover:text-primary transition-colors">
            {comparison.itemA} vs {comparison.itemB}
          </h3>
          <ArrowRight
            className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5"
            aria-hidden="true"
          />
        </div>

        <p className="text-pretty text-sm text-muted-foreground line-clamp-2">
          {comparison.verdict}
        </p>
      </Link>
    </article>
  );
}
