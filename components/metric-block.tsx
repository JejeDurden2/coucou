import { cn } from "@/lib/utils";

// Metric / stat block (design-system §7): Geist Mono uppercase label, then a
// large Space Grotesk tabular-nums figure. No boxed card. `marked` renders the
// single 2px lime underline reserved for one key element on the page.

type MetricBlockProps = {
  value: string;
  label: string;
  marked?: boolean;
  className?: string;
};

export function MetricBlock({ value, label, marked = false, className }: MetricBlockProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-[2.5rem] leading-none font-bold tracking-[-0.02em] tabular-nums text-foreground lg:text-[4rem]">
        {value}
      </span>
      {marked ? (
        <span aria-hidden className="mt-1 h-0.5 w-10 bg-primary" />
      ) : null}
    </div>
  );
}
