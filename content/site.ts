// Coucou IA : configuration et copie transverse du site.
// Source unique pour le nom, le CTA, la navigation et les liens. Reutilise partout.

export type NavLink = {
  label: string;
  href: string;
};

export const siteName = "Coucou IA";

export const tagline =
  "L’IA va changer votre quotidien. On sait par où commencer, et on s’engage sur le ROI.";

export const siteUrl = "https://coucou-ia.com";

export const contactEmail = "jerome@coucou-ia.com";

// Libelle du CTA. Unique sur tout le site : ne jamais creer de variante.
export const ctaLabel = "Réserver un diagnostic";

// Libelle du menu mobile (declencheur + titre du tiroir, pour l’accessibilite).
export const menuLabel = "Menu";

// URL de reservation publique Cal.com : le CTA unique pointe ici partout.
export const bookingHref = "https://cal.com/jerome-desmares-izhobq/30min";

// Ancres prefixees par "/" : depuis les pages legales, "#services" seul est un lien mort.
export const nav: NavLink[] = [
  { label: "Services", href: "/#services" },
  { label: "Méthode", href: "/#methode" },
  { label: "Garantie", href: "/#garantie" },
  { label: "Secteurs", href: "/secteurs" },
  { label: "Cas d’usage", href: "/cas-usage" },
];

export const footerLegalLinks: NavLink[] = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
];

// Positionnement d’une ligne pour le pied de page.
export const footerPositioning =
  "Conseil et développement IA pour les PME et ETI françaises. Un ROI mesurable, garanti.";

// Meta description (~150 caracteres, mots-cles en tete : conseil IA / PME / ETI / ROI).
export const description =
  "Conseil IA pour PME et ETI françaises : audit, business case chiffré, développement sur mesure et mise en production. ROI garanti, diagnostic gratuit.";
