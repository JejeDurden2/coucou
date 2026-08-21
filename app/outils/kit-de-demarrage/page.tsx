import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/breadcrumb";
import { KitForm } from "@/components/kit-form";
import { FaqList } from "@/components/sections/faq";
import { pageMetadata, serializeJsonLd, spokeJsonLd } from "@/lib/seo";
import { kit, kitCross, kitFaq, kitFaqTitle } from "@/content/kit";

// Kit de démarrage : l'outil du dirigeant qui fait écrire son premier outil par
// une IA et bloque sur tout le reste. Server Component ; l'arbre de décision et
// la capture email vivent dans le leaf client <KitForm>. Copie : content/kit.ts.
// La FAQ est rendue côté serveur : c'est elle qui porte le texte indexable et
// citable de la page (le parcours interactif reste maigre pour un crawler).

const path = "/outils/kit-de-demarrage";

export const metadata: Metadata = pageMetadata({
  title: kit.metaTitle,
  description: kit.metaDescription,
  path,
});

const breadcrumb = [{ label: "Accueil", href: "/" }, { label: "Kit de démarrage" }];

// Service + BreadcrumbList + FAQPage, le même @graph que les spokes.
const jsonLd = spokeJsonLd({
  name: kit.serviceName,
  description: kit.metaDescription,
  path,
  breadcrumb,
  faq: kitFaq,
});

export default function KitDeDemarragePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <main id="contenu">
        <section>
          <div className="mx-auto max-w-[1200px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
            <Breadcrumb items={breadcrumb} className="mb-8" />
            <div className="max-w-[52rem]">
              <h1 className="type-h1">
                {kit.h1}
              </h1>
              <p className="mt-6 max-w-[54ch] text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
                {kit.intro}
              </p>
            </div>
            <div className="mt-10 max-w-[46rem]">
              <KitForm />
            </div>
            <p className="mt-8 max-w-[46rem] text-sm leading-relaxed text-muted-foreground">
              {kitCross.body}{" "}
              <Link
                href={kitCross.href}
                className="rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {kitCross.linkLabel}
              </Link>
            </p>
          </div>
        </section>
        <FaqList title={kitFaqTitle} items={kitFaq} />
      </main>
    </>
  );
}
