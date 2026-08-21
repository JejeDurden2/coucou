import type { Metadata } from "next";

import { Breadcrumb } from "@/components/breadcrumb";
import { Cta } from "@/components/sections/cta";
import { contact } from "@/content/contact";
import { contactEmail, siteName, siteUrl } from "@/content/site";
import { breadcrumbGraph, businessAddress, pageMetadata } from "@/lib/seo";

// Page « nous joindre ». Même gabarit typographique que les pages légales :
// une colonne de 65ch, les sections en h2. Le seul CTA du site ferme la page.

export const metadata: Metadata = pageMetadata({
  title: contact.metaTitle,
  description: contact.metaDescription,
  path: "/contact",
});

const breadcrumb = [{ label: "Accueil", href: "/" }, { label: contact.h1 }];

const url = `${siteUrl}/contact`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${url}#page`,
      name: contact.h1,
      description: contact.metaDescription,
      url,
      about: { "@id": `${siteUrl}/#organization` },
      mainEntity: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: contactEmail,
        areaServed: "FR",
        availableLanguage: ["fr"],
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      email: contactEmail,
      address: businessAddress,
    },
    breadcrumbGraph(url, breadcrumb),
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main id="contenu">
        <article className="mx-auto max-w-[1200px] px-6 pt-12 pb-24 lg:pt-16 lg:pb-32">
          <Breadcrumb items={breadcrumb} />
          <div className="mx-auto mt-12 max-w-[65ch]">
            <h1 className="type-h1">{contact.h1}</h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              {contact.intro}
            </p>

            <div className="mt-12 flex flex-col gap-10">
              {contact.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="type-h3">{section.heading}</h2>
                  <div className="mt-3 flex flex-col gap-3">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-pretty leading-relaxed text-muted-foreground"
                      >
                        {paragraph}
                      </p>
                    ))}
                    {section.items ? (
                      <ul className="flex flex-col gap-2">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 leading-relaxed text-muted-foreground"
                          >
                            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </article>
        <Cta placement="contact" />
      </main>
    </>
  );
}
