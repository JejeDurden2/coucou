import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { Cta } from "@/components/sections/cta";
import { Fondateur } from "@/components/sections/fondateur";
import { pageMetadata } from "@/lib/seo";
import { fondateur, fondateurPage } from "@/content/fondateur";
import { siteUrl } from "@/content/site";

// Page dédiée au fondateur : l'URL à mettre dans un profil LinkedIn ou une
// signature d'email. La section de la page d'accueil est réutilisée telle
// quelle, avec son titre en h1.

export const metadata: Metadata = pageMetadata({
  title: fondateurPage.metaTitle,
  description: fondateurPage.metaDescription,
  path: "/fondateur",
});

const breadcrumb = [{ label: "Accueil", href: "/" }, { label: "Le fondateur" }];

const url = `${siteUrl}/fondateur`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${url}#person`,
      name: fondateur.name,
      jobTitle: fondateur.role,
      url,
      sameAs: [fondateur.linkedinUrl],
      worksFor: { "@id": `${siteUrl}/#organization` },
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

export default function FondateurPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main id="contenu">
        <div className="mx-auto max-w-[1200px] px-6 pt-12 lg:pt-16">
          <Breadcrumb items={breadcrumb} />
        </div>
        <Fondateur titleAs="h1" />
        <Cta placement="fondateur" />
      </main>
    </>
  );
}
