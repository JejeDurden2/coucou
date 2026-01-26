'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

interface HeaderProps {
  variant?: 'default' | 'blog';
}

const NAV_LINKS = [
  { label: 'Fonctionnalités', anchor: '#features' },
  { label: 'Tarifs', anchor: '#pricing' },
  { label: 'FAQ', anchor: '#faq' },
] as const;

export function Header({ variant = 'default' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const anchorPrefix = variant === 'blog' ? '/' : '';

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" onClick={closeMobileMenu}>
          <Logo size="sm" />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.anchor}
              href={`${anchorPrefix}${link.anchor}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Blog
          </Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Connexion</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Essayer gratuitement</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileMenuOpen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Menu className="size-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.anchor}
                href={`${anchorPrefix}${link.anchor}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Blog
            </Link>

            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
              <Button variant="ghost" asChild>
                <Link href="/login" onClick={closeMobileMenu}>
                  Connexion
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={closeMobileMenu}>
                  Essayer gratuitement
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
