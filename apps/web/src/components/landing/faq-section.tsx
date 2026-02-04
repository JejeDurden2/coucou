'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { faqs } from '@/components/landing/faq-data';

export function FAQSection() {
  return (
    <section id="faq" className="py-16 px-4 bg-zinc-900/50 scroll-mt-20 md:py-20">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <Badge variant="mono" className="mb-6">
            FAQ
          </Badge>
          <h2 className="font-display text-4xl mb-6 text-balance md:text-5xl">
            Questions fréquentes
          </h2>
          <p className="text-muted-foreground text-pretty leading-relaxed">
            Tout ce que vous devez savoir sur Coucou IA et la visibilité IA.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-base text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-pretty leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
