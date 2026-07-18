import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/scroll-reveal";
import { faq } from "@/content/faq";

export function Faq() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-[46rem]">
          <ScrollReveal>
            <h2 className="text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
              {faq.title}
            </h2>
            <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {faq.sub}
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-10">
            <Accordion className="border-t border-border">
              {faq.items.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={index}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="gap-6 py-5 text-base font-medium text-foreground">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <p className="max-w-[64ch] text-pretty leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
