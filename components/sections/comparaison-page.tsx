import { ScrollReveal } from "@/components/scroll-reveal";
import { SpokeHero } from "@/components/spoke-partials";
import { Cta } from "@/components/sections/cta";
import { FaqList } from "@/components/sections/faq";
import type { Crumb } from "@/components/breadcrumb";
import type { ComparaisonPage } from "@/content/comparaisons";
import { comparaisonsCopy } from "@/content/comparaisons";
import { spokes } from "@/content/spokes";

// Comparaison spoke template (Server Component). Order per brief: hero, verdict
// en tête, tableau comparatif, différences racontées, « quand choisir l'autre »,
// FAQ, CTA final. Composed from existing primitives; tokens only, one blue accent.
export function ComparaisonPageTemplate({
  page,
  breadcrumb,
}: {
  page: ComparaisonPage;
  breadcrumb: Crumb[];
}) {
  return (
    <>
      <SpokeHero breadcrumb={breadcrumb} h1={page.h1} intro={page.intro} />

      {/* Le verdict en 30 secondes, en tête. Le seul accent bleu de la section. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-4xl border-l-2 border-primary pl-6 lg:pl-8">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-primary">
              {comparaisonsCopy.verdictLabel}
            </span>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground lg:text-xl">
              {page.verdict}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Tableau comparatif. Desktop : 3 colonnes alignées. Mobile : empilement,
          chaque cellule porte son propre libellé (l'en-tête est masqué). */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-[46rem]">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
              {comparaisonsCopy.tableTitle}
            </h2>
          </ScrollReveal>
          <ScrollReveal className="mt-10 overflow-hidden rounded-lg border border-border">
            <div className="hidden md:grid md:grid-cols-[1.1fr_1fr_1fr]">
              <div className="px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {comparaisonsCopy.criterionHead}
              </div>
              <div className="border-l border-border px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] text-primary">
                {comparaisonsCopy.coucouHead}
              </div>
              <div className="border-l border-border px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {page.otherColumn}
              </div>
            </div>
            {page.comparison.map((row, index) => (
              <div
                key={row.criterion}
                className={`grid grid-cols-1 border-t border-border md:grid-cols-[1.1fr_1fr_1fr]${
                  index === 0 ? " max-md:border-t-0" : ""
                }`}
              >
                <div className="px-6 py-5">
                  <span className="font-display text-base leading-snug font-medium tracking-[-0.01em] text-foreground">
                    {row.criterion}
                  </span>
                </div>
                <div className="border-t border-border px-6 py-5 md:border-t-0 md:border-l md:border-border">
                  <span className="mb-2 block font-mono text-xs uppercase tracking-[0.12em] text-primary md:hidden">
                    {comparaisonsCopy.coucouHead}
                  </span>
                  <p className="text-pretty text-sm leading-relaxed text-foreground">
                    {row.coucou}
                  </p>
                </div>
                <div className="border-t border-border px-6 py-5 md:border-t-0 md:border-l md:border-border">
                  <span className="mb-2 block font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground md:hidden">
                    {page.otherColumn}
                  </span>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {row.other}
                  </p>
                </div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* Les différences, racontées. */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="max-w-[46rem]">
            <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
              {comparaisonsCopy.differencesTitle}
            </h2>
          </ScrollReveal>
          <div className="mt-6 flex flex-col lg:mt-8">
            {page.differences.map((diff, index) => (
              <ScrollReveal key={diff.title} delay={index * 0.04}>
                <div className="grid grid-cols-1 gap-3 border-t border-border py-8 lg:grid-cols-12 lg:gap-10">
                  <h3 className="text-balance font-display text-xl leading-snug font-medium tracking-[-0.01em] lg:col-span-5">
                    {diff.title}
                  </h3>
                  <p className="max-w-[62ch] text-pretty leading-relaxed text-muted-foreground lg:col-span-7">
                    {diff.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Quand choisir l'autre option. Sincère, marqueurs neutres (pas d'accent). */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
          <ScrollReveal className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="text-balance font-display text-2xl leading-snug font-medium tracking-[-0.01em] lg:text-[1.75rem]">
                {page.whenOther.title}
              </h2>
              <p className="mt-4 max-w-[46ch] text-pretty leading-relaxed text-muted-foreground">
                {page.whenOther.body}
              </p>
            </div>
            <ul className="flex flex-col gap-4 lg:col-span-7">
              {page.whenOther.cases.map((item) => (
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

      <FaqList title={spokes.faqTitle} items={page.faq} />

      <Cta placement={`comparaison-${page.slug}`} />
    </>
  );
}
