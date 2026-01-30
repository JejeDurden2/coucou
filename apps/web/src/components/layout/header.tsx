'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  variant?: 'default' | 'blog';
}

interface NavLink {
  label: string;
  href: string;
  isAbsolute?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Tarifs', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Blog', href: '/blog', isAbsolute: true },
];

export function Header({ variant = 'default' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const anchorPrefix = variant === 'blog' ? '/' : '';

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function getHref(link: NavLink): string {
    return link.isAbsolute ? link.href : `${anchorPrefix}${link.href}`;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" onClick={closeMobileMenu}>
          <Logo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={getHref(link)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              Ressources
              <ChevronDown className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link href="/lexique">Lexique GEO</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/geo-pour">GEO par métier</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Connexion</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Essayer gratuitement</Link>
          </Button>
        </div>

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

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={getHref(link)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider py-2">
                Ressources
              </p>
              <Link
                href="/lexique"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Lexique GEO
              </Link>
              <Link
                href="/geo-pour"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={closeMobileMenu}
              >
                GEO par métier
              </Link>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-border">
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
