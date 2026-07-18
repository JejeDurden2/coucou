"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { bookingHref, ctaLabel, menuLabel, nav, siteName } from "@/content/site";

const linkClasses =
  "rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Boolean threshold: React bails on an unchanged value, so the header
  // re-renders only when it crosses, not per scrolled pixel (§6).
  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 8);
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-16 w-full border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
        <a
          href="#top"
          className={cn(
            linkClasses,
            "flex items-center gap-2 font-display text-base font-bold tracking-[-0.01em] text-foreground"
          )}
        >
          <span>{siteName}</span>
          <span aria-hidden className="size-1.5 rounded-sm bg-primary" />
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                linkClasses,
                "text-sm text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button render={<a href={bookingHref} />} size="default">
            {ctaLabel}
          </Button>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={menuLabel}
                  className="lg:hidden"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 gap-0 p-0">
              <SheetTitle className="sr-only">{menuLabel}</SheetTitle>
              <nav className="flex flex-col gap-1 px-4 pt-16">
                {nav.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={<a href={link.href} />}
                    className={cn(
                      linkClasses,
                      "rounded-md px-3 py-3 text-base text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
