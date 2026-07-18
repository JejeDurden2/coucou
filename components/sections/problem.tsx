import { ScrollReveal } from "@/components/scroll-reveal";
import { problem } from "@/content/problem";

export function Problem() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <ScrollReveal className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
              {problem.title}
            </h2>
            <p className="mt-6 max-w-[48ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {problem.body}
            </p>
          </div>

          <ul className="flex flex-col gap-6 lg:pt-1.5">
            {problem.pains.map((pain) => (
              <li
                key={pain}
                className="border-l-2 border-primary/60 pl-5 text-lg leading-relaxed text-balance text-foreground"
              >
                {pain}
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
