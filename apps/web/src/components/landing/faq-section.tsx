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
    <section id="faq" className="py-20 px-4 bg-zinc-900/50 scroll-mt-20">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">FAQ</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Questions fréquentes</h2>
          <p className="text-muted-foreground text-pretty">
            Tout ce que vous devez savoir sur Coucou IA et la visibilité IA.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-base text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-pretty">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
