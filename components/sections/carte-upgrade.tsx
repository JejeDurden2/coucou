import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ressources, ressourcesShared } from "@/content/ressources";

// Content upgrade discret en bas des pages secteurs : la carte du meme secteur
// quand elle existe, sinon le kit de demarrage (valable quel que soit le metier).
export function CarteUpgrade({ secteurSlug }: { secteurSlug: string }) {
  const ressource = ressources.find((entry) => entry.secteurSlug === secteurSlug);
  const upgrade = ressource
    ? {
        title: ressourcesShared.upgradeTitle,
        body: ressourcesShared.upgradeBody,
        cta: ressourcesShared.upgradeCta,
        href: `/ressources/${ressource.slug}`,
      }
    : {
        title: ressourcesShared.upgradeKitTitle,
        body: ressourcesShared.upgradeKitBody,
        cta: ressourcesShared.upgradeKitCta,
        href: "/outils/kit-de-demarrage",
      };

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
        <ScrollReveal className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h2 className="type-h4">
              {upgrade.title}
            </h2>
            <p className="mt-2 max-w-[54ch] text-pretty text-sm leading-relaxed text-muted-foreground">
              {upgrade.body}
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href={upgrade.href} />}
            variant="outline"
          >
            {upgrade.cta}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
