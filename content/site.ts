// Coucou IA : configuration et copie transverse du site.
// Source unique pour le nom, le CTA, la navigation et les liens. Reutilise partout.

export type NavLink = {
  label: string;
  href: string;
};

export const siteName = "Coucou IA";

export const tagline =
  "Tout le monde vous parle d’IA. On sait par où commencer, et on le met en production.";

export const siteUrl = "https://coucou-ia.com";

export const contactEmail = "jerome@coucou-ia.com";

// Libelle du CTA. Unique sur tout le site : ne jamais creer de variante.
export const ctaLabel = "Trouver mon point de départ";

// Libelle du menu mobile (declencheur + titre du tiroir, pour l’accessibilite).
export const menuLabel = "Menu";

// URL de reservation publique Cal.com : le CTA unique pointe ici partout.
const bookingHref = "https://cal.com/jerome-desmares-izhobq/30min";

// ponytail: attribution par emplacement via UTM (visible cote Cal.com), zero JS client.
export const bookingUrl = (placement: string) =>
  `${bookingHref}?utm_source=site&utm_medium=cta&utm_content=${placement}`;

// Ancres prefixees par "/" : depuis les pages legales, "#services" seul est un lien mort.
export const nav: NavLink[] = [
  { label: "Services", href: "/#services" },
  { label: "Méthode", href: "/#methode" },
  { label: "Secteurs", href: "/secteurs" },
  { label: "Cas d’usage", href: "/cas-usage" },
];

export const footerLegalLinks: NavLink[] = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
];

// Pages outils et contenu : liées ici pour qu'aucune ne soit orpheline.
export const footerResourceLinks: NavLink[] = [
  { label: "Bien choisir son partenaire IA", href: "/comparaison" },
  { label: "Glossaire : l’IA sans jargon", href: "/glossaire" },
  { label: "Par où commencer ?", href: "/outils/par-ou-commencer" },
];

// Positionnement d’une ligne pour le pied de page.
export const footerPositioning =
  "Conseil et développement IA pour les PME et ETI françaises. On trouve ce que l’IA rend possible chez vous, et on le construit.";

// Meta description (~145 caracteres, mots-cles en tete : conseil IA / PME / ETI).
export const description =
  "Conseil IA pour PME et ETI : on trouve ce que l’IA rend possible chez vous et on le met en production. Business case chiffré, premier échange gratuit.";
