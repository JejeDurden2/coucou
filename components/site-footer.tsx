import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FooterYear } from "@/components/footer-year";
import { LogoMark } from "@/components/logo-mark";
import {
  bookingUrl,
  contactEmail,
  ctaLabel,
  footerHeadings,
  footerLegalLinks,
  footerPositioning,
  footerResourceLinks,
  nav,
  siteName,
} from "@/content/site";
import { villes } from "@/content/villes";

const linkClasses =
  "rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const headingClasses =
  "font-mono text-xs font-medium uppercase tracking-[0.12em] text-foreground-dim";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          {/* Bloc marque : identité, positionnement, contact et le CTA unique. */}
          <div className="max-w-[42ch]">
            <div className="flex items-center gap-2 font-display text-base font-bold tracking-[-0.01em] text-foreground">
              <LogoMark className="size-6 text-primary" />
              <span>{siteName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {footerPositioning}
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className={cn(linkClasses, "mt-4 inline-block")}
            >
              {contactEmail}
            </a>
            <div className="mt-8">
              <Button nativeButton={false} render={<a href={bookingUrl("footer")} />} size="default">
                {ctaLabel}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
            <nav aria-label={footerHeadings.site} className="flex flex-col gap-3">
              <p className={headingClasses}>{footerHeadings.site}</p>
              {nav.map((link) => (
                <Link key={link.href} href={link.href} className={linkClasses}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <nav aria-label={footerHeadings.ressources} className="flex flex-col gap-3">
              <p className={headingClasses}>{footerHeadings.ressources}</p>
              {footerResourceLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClasses}>
                  {link.label}
                </Link>
              ))}
            </nav>
            {/* Zones : les pages locales et le hub départemental, dérivés du tableau villes. */}
            <nav aria-label={footerHeadings.zones} className="flex flex-col gap-3">
              <p className={headingClasses}>{footerHeadings.zones}</p>
              {villes.map((ville) => (
                <Link
                  key={ville.slug}
                  href={`/${ville.slug}`}
                  className={linkClasses}
                >
                  Consultant IA {ville.inName}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            © <FooterYear /> {siteName}
          </p>
          <nav aria-label="Informations légales" className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLegalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(linkClasses, "text-xs")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
