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
      // La recherche de marque tape aussi bien « Coucou IA » que « Coucou.IA »
      // ou la raison sociale : les trois désignent la même entité.
      alternateName: ["Coucou.IA", "COUCOU IA"],
      legalName: "COUCOU IA",
      url: siteUrl,
      description,
      email: contactEmail,
      // Requis par Google pour les resultats enrichis LocalBusiness.
      image: `${siteUrl}/opengraph-image`,
      logo: `${siteUrl}/brand/avatar-coucou-ia-1024.png`,
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
      founder: { "@id": `${siteUrl}/#jerome-desmares` },
      // Un agent qui vérifie une entreprise cherche par quel bout la joindre.
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: contactEmail,
        url: `${siteUrl}/contact`,
        areaServed: "FR",
        availableLanguage: ["fr"],
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
    // Nœud à part plutôt qu'imbriqué dans `founder` : un lecteur de JSON-LD
    // qui isole les entités trouve une identité complète, pas un nom seul.
    {
      "@type": "Person",
      "@id": `${siteUrl}/#jerome-desmares`,
      name: fondateur.name,
      description: fondateur.bio,
      jobTitle: fondateur.role,
      url: `${siteUrl}/fondateur`,
      sameAs: [fondateur.linkedinUrl],
      worksFor: { "@id": `${siteUrl}/#organization` },
      knowsLanguage: "fr",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: siteName,
      alternateName: "Coucou.IA",
      url: siteUrl,
      description,
      inLanguage: "fr-FR",
      publisher: { "@id": `${siteUrl}/#organization` },
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
