import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/scroll-reveal";
import { faq } from "@/content/faq";

// Reusable FAQ section: same visual pattern reused by the home page and the
// programmatic SEO spokes. Accepts any {question, answer} collection so the
// secteur / cas-usage FAQ items feed it without coupling to the home content.
export function FaqList({
  title,
  sub,
  items,
}: {
  title: string;
  sub?: string;
  items: {
    question: string;
    answer: string;
    link?: { label: string; href: string };
  }[];
}) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-[46rem]">
          <ScrollReveal>
            <h2 className="type-h2">
              {title}
            </h2>
            {sub ? (
              <p className="mt-5 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground">
                {sub}
              </p>
            ) : null}
          </ScrollReveal>

          <ScrollReveal className="mt-10">
            <Accordion className="border-t border-border">
              {items.map((item, index) => (
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
                    {item.link ? (
                      <Link
                        href={item.link.href}
                        className="mt-3 inline-block rounded-sm text-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {item.link.label}
                      </Link>
                    ) : null}
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

export function Faq() {
  return <FaqList title={faq.title} sub={faq.sub} items={faq.items} />;
}
