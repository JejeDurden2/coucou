import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/scroll-reveal";
import { method } from "@/content/method";

export function Method() {
  return (
    <section id="methode" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="max-w-[46rem]">
          <h2 className="text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
            {method.title}
          </h2>
          <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
            {method.sub}
          </p>
        </ScrollReveal>

        {/* Vertical measured rail: the numbers are the nodes, the hairline is
            the tracé, the last step turns lime as the ROI terminus. */}
        <ol className="mt-14 lg:mt-16">
          {method.steps.map((step, index) => {
            const last = index === method.steps.length - 1;
            return (
              <ScrollReveal key={step.number} delay={index * 0.05}>
                <li className="relative grid grid-cols-[3.5rem_1fr] gap-x-6 pb-12 last:pb-0 lg:grid-cols-[5rem_1fr] lg:gap-x-10">
                  {!last ? (
                    <span
                      aria-hidden
                      className="absolute top-7 bottom-0 left-[1.75rem] w-px -translate-x-1/2 bg-border lg:left-[2.5rem]"
                    />
                  ) : null}

                  <div className="flex justify-center">
                    <span
                      className={cn(
                        "relative z-10 bg-background pb-2 font-mono text-sm tabular-nums",
                        last ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {step.number}
                    </span>
                  </div>

                  <div className="pb-1">
                    <h3 className="font-display text-xl leading-snug font-medium tracking-[-0.01em]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    <p className="mt-3 font-mono text-xs text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              </ScrollReveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
