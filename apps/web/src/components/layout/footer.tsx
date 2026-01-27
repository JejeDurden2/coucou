import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Badge } from '@/components/ui/badge';

export function Footer() {
  return (
    <footer className="bg-card border-t border-zinc-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <p className="text-sm text-muted-foreground mt-2 text-pretty">
              Surveillez votre visibilité dans la recherche IA.
            </p>
          </div>
          <nav aria-label="Produit">
            <h4 className="font-medium mb-4">Produit</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#pricing" className="hover:text-foreground">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Légal">
            <h4 className="font-medium mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  CGU
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Coucou IA. Made in France 🇫🇷</p>
          <Badge variant="outline">
            <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
            RGPD
          </Badge>
        </div>
      </div>
    </footer>
  );
}
