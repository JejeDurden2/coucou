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
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Conçu pour les équipes qui veulent prendre de l&apos;avance
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SOCIAL_PROOF_ITEMS.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <Icon className="size-4 text-primary" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
