import type { Metadata } from "next";

import { confidentialite } from "@/content/legal";

export const metadata: Metadata = {
  title: confidentialite.title,
  description:
    "Politique de confidentialité de Coucou IA : cookies, données transmises et droits RGPD.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
  return (
    <main id="contenu">
      <article className="mx-auto max-w-[1200px] px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="mx-auto max-w-[65ch]">
          <h1 className="type-h2">
            {confidentialite.title}
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            {"Dernière mise à jour : "}
            {confidentialite.updated}
          </p>

          <div className="mt-12 flex flex-col gap-10">
            {confidentialite.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="type-h3">
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
