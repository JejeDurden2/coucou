import Link from "next/link";

import { cn } from "@/lib/utils";

// Visible breadcrumb for the spokes and hubs (hub -> page). The matching
// JSON-LD BreadcrumbList is built in the page via lib/seo. The last item is
// the current page and renders as plain text with aria-current.
type Crumb = { label: string; href?: string };

const linkClasses =
  "rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Fil d'ariane" className={className}>
      <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href ?? item.label} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className={linkClasses}>
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(last && "text-foreground")}
                >
                  {item.label}
                </span>
              )}
              {last ? null : (
                <span aria-hidden className="text-foreground-dim">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
