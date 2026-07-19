import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ressources, ressourcesShared } from "@/content/ressources";

// Content upgrade discret en bas des pages secteurs, vers la carte du meme
// secteur. Rendu nul si aucune ressource ne correspond (le tableau `ressources`
// peut encore etre vide ou incomplet pendant la redaction).
export function CarteUpgrade({ secteurSlug }: { secteurSlug: string }) {
  const ressource = ressources.find((entry) => entry.secteurSlug === secteurSlug);
  if (!ressource) {
    return null;
  }

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-10 lg:py-12">
        <ScrollReveal className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h2 className="font-display text-xl leading-snug font-medium tracking-[-0.01em]">
              {ressourcesShared.upgradeTitle}
            </h2>
            <p className="mt-2 max-w-[54ch] text-pretty text-sm leading-relaxed text-muted-foreground">
              {ressourcesShared.upgradeBody}
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href={`/ressources/${ressource.slug}`} />}
            variant="outline"
          >
            {ressourcesShared.upgradeCta}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
