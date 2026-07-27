import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { KitForm } from "@/components/kit-form";
import { pageMetadata } from "@/lib/seo";
import { kit } from "@/content/kit";
import { siteUrl } from "@/content/site";

// Kit de démarrage : l'outil du dirigeant qui fait écrire son premier outil par
// une IA et bloque sur tout le reste. Server Component ; l'arbre de décision et
// la capture email vivent dans le leaf client <KitForm>. Copie : content/kit.ts.

const path = "/outils/kit-de-demarrage";

export const metadata: Metadata = pageMetadata({
  title: kit.metaTitle,
  description: kit.metaDescription,
  path,
});

const breadcrumb = [{ label: "Accueil", href: "/" }, { label: "Kit de démarrage" }];

// JSON-LD Service + BreadcrumbList, même modèle que /outils/par-ou-commencer.
const url = `${siteUrl}${path}`;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      name: kit.serviceName,
      description: kit.metaDescription,
      url,
      provider: {
        "@type": "ProfessionalService",
        name: "COUCOU IA",
        url: siteUrl,
      },
      areaServed: {
        "@type": "Country",
        name: "France",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: breadcrumb.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.label,
        ...(crumb.href ? { item: `${siteUrl}${crumb.href}` } : {}),
      })),
    },
  ],
};

export default function KitDeDemarragePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main id="contenu">
        <section>
          <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
            <Breadcrumb items={breadcrumb} className="mb-8" />
            <div className="max-w-[52rem]">
              <h1 className="text-balance font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] sm:text-5xl">
                {kit.h1}
              </h1>
              <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
                {kit.intro}
              </p>
            </div>
            <div className="mt-10 max-w-[46rem]">
              <KitForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
