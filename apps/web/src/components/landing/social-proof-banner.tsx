import { Building2, Rocket, Search, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface SocialProofItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const SOCIAL_PROOF_ITEMS: SocialProofItem[] = [
  { icon: Rocket, label: 'Startups Tech', href: '/geo-pour/startups' },
  { icon: Search, label: 'Experts SEO', href: '/geo-pour/consultants-seo' },
  { icon: ShoppingBag, label: 'E-commerce', href: '/geo-pour/ecommerce' },
  { icon: Building2, label: 'Agences Marketing', href: '/geo-pour/agences-marketing' },
];

export function SocialProofBanner() {
  return (
    <section className="-mt-8 pb-8 px-4">
      <div className="container mx-auto max-w-5xl text-center">
        <p className="font-sans text-xs uppercase tracking-wide text-muted-foreground mb-8">
          Conçu pour les équipes qui veulent prendre de l&apos;avance
        </p>
        {/* Technical grid with gap-px for data table aesthetic */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {SOCIAL_PROOF_ITEMS.map(({ icon: Icon, label, href }, i) => (
            <Link
              key={label}
              href={href}
              className="bg-card border border-border p-6 hover:bg-card-hover transition-colors group flex flex-col items-center justify-center gap-4"
            >
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
                [{String(i + 1).padStart(2, '0')}]
              </p>
              <Icon
                className="size-8 text-primary group-hover:text-secondary-accent transition-colors"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
