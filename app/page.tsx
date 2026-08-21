import type { Metadata } from "next";
import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Fondateur } from "@/components/sections/fondateur";
import { Hero } from "@/components/sections/hero";
import { Method } from "@/components/sections/method";
import { Problem } from "@/components/sections/problem";
import { Realisations } from "@/components/sections/realisations";
import { Services } from "@/components/sections/services";
import { UseCases } from "@/components/sections/use-cases";
import { faq } from "@/content/faq";
import { fondateur } from "@/content/fondateur";
import { services } from "@/content/services";
import { contactEmail, description, siteName, siteUrl } from "@/content/site";
import { serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Identifiants legaux de la structure @graph, source : content/legal.ts (mentions legales).
// Adresse, SIREN et TVA repris tels quels, non exportes de content/legal.ts (donnees en prose la-bas).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      legalName: "COUCOU IA",
      url: siteUrl,
      description,
      email: contactEmail,
      // Requis par Google pour les resultats enrichis LocalBusiness.
      image: `${siteUrl}/opengraph-image`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "460 avenue de Pessicart",
        postalCode: "06100",
        addressLocality: "Nice",
        addressCountry: "FR",
      },
      // Le département ancre l'entité localement, la France rappelle que la visio couvre le reste.
      areaServed: [
        { "@type": "AdministrativeArea", name: "Alpes-Maritimes" },
        { "@type": "Country", name: "France" },
      ],
      // Le parcours vérifiable du fondateur est l'argument de confiance :
      // exposé aux moteurs, pas seulement aux visiteurs.
      sameAs: [fondateur.linkedinUrl],
      founder: {
        "@type": "Person",
        name: fondateur.name,
        jobTitle: fondateur.role,
        url: `${siteUrl}/fondateur`,
        sameAs: [fondateur.linkedinUrl],
      },
      vatID: "FR83100498070",
      identifier: {
        "@type": "PropertyValue",
        propertyID: "SIREN",
        value: "100498070",
      },
      knowsAbout: [
        "Intelligence artificielle",
        "Agents IA",
        "RAG",
        "Automatisation de processus métiers",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services Coucou IA",
        itemListElement: services.offers.map((offer, index) => ({
          "@type": "Offer",
          position: index + 1,
          itemOffered: {
            "@type": "Service",
            name: offer.title,
            description: offer.description,
          },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: faq.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <main id="contenu">
        <Hero />
        <Problem />
        <Realisations />
        <Services />
        <Method />
        <UseCases />
        <Fondateur />
        <Faq />
        <Cta />
      </main>
    </>
  );
}
