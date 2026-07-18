import type { Metadata } from "next";

import { mentionsLegales } from "@/content/legal";

export const metadata: Metadata = {
  title: mentionsLegales.title,
  description:
    "Informations légales de Coucou IA : éditeur du site, hébergement, propriété intellectuelle et responsabilité.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <main id="contenu">
      <article className="mx-auto max-w-[1200px] px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="mx-auto max-w-[65ch]">
          <h1 className="text-balance font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.02em] lg:text-[2.75rem]">
            {mentionsLegales.title}
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            {"Dernière mise à jour : "}
            {mentionsLegales.updated}
          </p>

          <div className="mt-12 flex flex-col gap-10">
            {mentionsLegales.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl leading-[1.2] font-medium tracking-[-0.01em]">
                  {section.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.paragraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-pretty leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
