import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FooterYear } from "@/components/footer-year";
import { LogoMark } from "@/components/logo-mark";
import {
  bookingUrl,
  contactEmail,
  ctaLabel,
  footerLegalLinks,
  footerPositioning,
  nav,
  siteName,
} from "@/content/site";

const linkClasses =
  "rounded-sm text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
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
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16 lg:gap-20">
            <nav aria-label="Pages du site" className="flex flex-col gap-3">
              {nav.map((link) => (
                <Link key={link.href} href={link.href} className={linkClasses}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="Informations légales" className="flex flex-col gap-3">
              {footerLegalLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClasses}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Button nativeButton={false} render={<a href={bookingUrl("footer")} />} size="default">
            {ctaLabel}
          </Button>
        </div>

        <div className="mt-14 border-t border-border pt-6">
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            © <FooterYear /> {siteName}
          </p>
        </div>
      </div>
    </footer>
  );
}
