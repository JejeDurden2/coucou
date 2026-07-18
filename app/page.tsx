import type { Metadata } from "next";
import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Guarantee } from "@/components/sections/guarantee";
import { Hero } from "@/components/sections/hero";
import { Method } from "@/components/sections/method";
import { Problem } from "@/components/sections/problem";
import { Services } from "@/components/sections/services";
import { UseCases } from "@/components/sections/use-cases";
import { faq } from "@/content/faq";
import { services } from "@/content/services";
import { contactEmail, description, siteName, siteUrl } from "@/content/site";

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
      name: "COUCOU IA",
      url: siteUrl,
      description,
      email: contactEmail,
      address: {
        "@type": "PostalAddress",
        streetAddress: "460 avenue de Pessicart",
        postalCode: "06100",
        addressLocality: "Nice",
        addressCountry: "FR",
      },
      areaServed: {
        "@type": "Country",
        name: "France",
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
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main>
        <Hero />
        <Problem />
        <Services />
        <Method />
        <UseCases />
        <Guarantee />
        <Faq />
        <Cta />
      </main>
    </>
  );
}
