import { Building2, Rocket, Search, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SocialProofItem {
  icon: LucideIcon;
  label: string;
}

const SOCIAL_PROOF_ITEMS: SocialProofItem[] = [
  { icon: Rocket, label: 'Startups Tech' },
  { icon: Search, label: 'Experts SEO' },
  { icon: ShoppingBag, label: 'E-commerce' },
  { icon: Building2, label: 'Agences Marketing' },
];

export function SocialProofBanner() {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Conçu pour les équipes qui veulent prendre de l&apos;avance
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SOCIAL_PROOF_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-muted-foreground"
            >
              <Icon className="size-4 text-primary" aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
