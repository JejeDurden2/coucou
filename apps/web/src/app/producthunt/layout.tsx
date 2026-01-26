import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offre Product Hunt - Coucou IA',
  description:
    'Offre exclusive Product Hunt : -50% sur votre première année Coucou IA. Surveillez votre visibilité dans la recherche IA à prix réduit.',
  robots: { index: true, follow: true },
};

export default function ProductHuntLayout({ children }: { children: React.ReactNode }) {
  return children;
}
