// Coucou IA : configuration et copie transverse du site.
// Source unique pour le nom, le CTA, la navigation et les liens. Reutilise partout.

export type NavLink = {
  label: string;
  href: string;
};

export const siteName = "Coucou IA";

export const tagline =
  "L'IA qui rapporte, installée en production. ROI garanti, pas des slides.";

// TODO fondateur : confirmer le domaine definitif.
export const siteUrl = "https://coucou-ia.fr";

// TODO fondateur : confirmer l'adresse de contact.
export const contactEmail = "contact@coucou-ia.fr";

// Libelle du CTA. Unique sur tout le site : ne jamais creer de variante.
export const ctaLabel = "Réserver un diagnostic";

// Libelle du menu mobile (declencheur + titre du tiroir, pour l'accessibilite).
export const menuLabel = "Menu";

// TODO fondateur : remplacer par l'URL de reservation (Cal.com / Calendly) et confirmer l'email.
export const bookingHref = `mailto:${contactEmail}?subject=Diagnostic%20IA%20gratuit`;

export const nav: NavLink[] = [
  { label: "Services", href: "#services" },
  { label: "Méthode", href: "#methode" },
  { label: "Garantie", href: "#garantie" },
];

export const footerLegalLinks: NavLink[] = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
];

// Positionnement d'une ligne pour le pied de page.
export const footerPositioning =
  "Conseil et développement IA pour les PME et ETI françaises. Un ROI mesurable, garanti.";

// Meta description (~150 caracteres, mots-cles en tete : conseil IA / PME / ETI / ROI).
export const description =
  "Conseil IA pour PME et ETI françaises : audit, stratégie et développement sur mesure. ROI garanti, systèmes déployés en production, pas des slides.";
