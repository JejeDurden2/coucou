import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SpokeHero, RelatedLinks } from "@/components/spoke-partials";
import { Cta } from "@/components/sections/cta";
import { FaqList } from "@/components/sections/faq";
import { pageMetadata, serializeJsonLd, spokeJsonLd } from "@/lib/seo";
import { agents, agentsCopy } from "@/content/agents";
import { bookingUrl, ctaLabel } from "@/content/site";
import { spokes } from "@/content/spokes";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = agents.find((agent) => agent.slug === slug);
  if (!page) {
    return {};
  }
  return pageMetadata({
    ownOgImage: true,
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/agents-ia/${slug}`,
  });
}

export default async function AgentSpokePage({ params }: Params) {
  const { slug } = await params;
  const page = agents.find((agent) => agent.slug === slug);
  if (!page) {
    notFound();
  }

  // Un seul fil d’ariane : le <Breadcrumb> visible (dans SpokeHero) et le
  // JSON-LD BreadcrumbList partagent ce tableau. Dernier maillon sans href.
  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: "Agents IA", href: "/agents-ia" },
    { label: page.name },
  ];

  const jsonLd = spokeJsonLd({
    name: page.h1,
    description: page.metaDescription,
    path: `/agents-ia/${slug}`,
    breadcrumb,
    faq: page.faq,
  });

  const otherAgent = agents.find((agent) => agent.slug !== page.slug);
  const relatedLinks = [
    ...(otherAgent
      ? [{ href: `/agents-ia/${otherAgent.slug}`, name: otherAgent.name }]
      : []),
    { href: agentsCopy.compareLinkHref, name: agentsCopy.compareLinkName },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <main id="contenu">
        <SpokeHero breadcrumb={breadcrumb} h1={page.h1} intro={page.intro} />

        {/* Le verdict en 30 secondes, en tête. Le seul accent bleu de la section. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="max-w-4xl border-l-2 border-primary pl-6 lg:pl-8">
              <span className="type-label text-primary">
                {agentsCopy.verdictLabel}
              </span>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground lg:text-xl">
                {page.verdict}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Fiche d’identité : jamais de prix Coucou IA, seulement le coût de l’outil. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="max-w-[46rem]">
              <h2 className="type-h3">
                {agentsCopy.factsTitle}
              </h2>
            </ScrollReveal>
            <ScrollReveal className="mt-10 overflow-hidden rounded-lg border border-border">
              {page.facts.map((fact, index) => (
                <div
                  key={fact.label}
                  className={`grid grid-cols-1 border-t border-border sm:grid-cols-[minmax(0,14rem)_1fr]${
                    index === 0 ? " border-t-0" : ""
                  }`}
                >
                  <div className="px-6 py-5">
                    <span className="type-label text-muted-foreground">
                      {fact.label}
                    </span>
                  </div>
                  <div className="border-t border-border px-6 py-5 sm:border-t-0 sm:border-l sm:border-border">
                    <p className="text-pretty text-sm leading-relaxed text-foreground">
                      {fact.value}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollReveal>
          </div>
        </section>

        {/* Ce qui marche vraiment. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="max-w-[46rem]">
              <h2 className="type-h3">
                {agentsCopy.strengthsTitle}
              </h2>
            </ScrollReveal>
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {page.strengths.map((strength, index) => (
                <ScrollReveal key={strength.title} delay={index * 0.04}>
                  <div className="h-full rounded-lg border border-border bg-card p-6">
                    <h3 className="type-h5 text-foreground">
                      {strength.title}
                    </h3>
                    <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {strength.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Ce qui doit vous alerter. Marqueurs neutres, pas d’accent bleu. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="max-w-[46rem]">
              <h2 className="type-h3">
                {agentsCopy.risksTitle}
              </h2>
            </ScrollReveal>
            <div className="mt-6 flex flex-col lg:mt-8">
              {page.risks.map((risk, index) => (
                <ScrollReveal key={risk.title} delay={index * 0.04}>
                  <div className="grid grid-cols-1 gap-3 border-t border-border py-8 lg:grid-cols-12 lg:gap-10">
                    <h3 className="type-h4 lg:col-span-5">
                      {risk.title}
                    </h3>
                    <p className="max-w-[62ch] text-pretty leading-relaxed text-muted-foreground lg:col-span-7">
                      {risk.body}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Quand ça a du sens pour une PME. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
            <ScrollReveal className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <h2 className="type-h3">
                  {page.forWho.title}
                </h2>
                <p className="mt-4 max-w-[46ch] text-pretty leading-relaxed text-muted-foreground">
                  {page.forWho.body}
                </p>
              </div>
              <ul className="flex flex-col gap-4 lg:col-span-7">
                {page.forWho.cases.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-5 text-pretty leading-relaxed text-foreground"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground-dim"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>
        </section>

        {/* Bloc offre « On vous l’installe » : après l’analyse, avant la FAQ.
            Vend l’installation sans renier le décryptage : la phrase honnête
            (`offer.honest`) dit quand ne pas installer. */}
        {page.offer && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
              <ScrollReveal className="rounded-lg border border-border bg-card p-8 lg:p-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
                  <div className="lg:col-span-5">
                    <h2 className="type-h3">
                      {page.offer.title}
                    </h2>
                    <p className="mt-4 max-w-[46ch] text-pretty leading-relaxed text-muted-foreground">
                      {page.offer.intro}
                    </p>
                  </div>
                  <div className="lg:col-span-7">
                    <ul className="flex flex-col gap-4">
                      {page.offer.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-pretty leading-relaxed text-foreground"
                        >
                          <span
                            aria-hidden
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground-dim"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 max-w-[62ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                      {page.offer.honest}
                    </p>
                    <div className="mt-8">
                      <Button
                        nativeButton={false}
                        render={<a href={bookingUrl(`agents-ia-${page.slug}-offre`)} />}
                        size="lg"
                      >
                        {ctaLabel}
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        <FaqList title={spokes.faqTitle} items={page.faq} />

        <RelatedLinks heading={agentsCopy.crossLinkHeading} links={relatedLinks} />

        <Cta placement={`agents-ia-${page.slug}`} />
      </main>
    </>
  );
}
