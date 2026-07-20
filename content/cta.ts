// CTA final. Clin d’oeil autorisé dans le titre. Le libellé du bouton vient de site.ts (ctaLabel).

export type FinalCta = {
  title: string;
  sub: string;
  // Sortie douce : le lecteur pas prêt pour un appel laisse un email via les cartes.
  softExitIntro: string;
};

export const finalCta: FinalCta = {
  title: "Coucou. On regarde ce que l’IA rend possible chez vous ?",
  sub: "30 minutes, gratuites et sans engagement. Vous repartez avec un avis franc et vos premières pistes : où l’IA rapporte chez vous, et où elle ne sert à rien.",
  softExitIntro: "Pas prêt pour un appel ? Emportez la carte des possibles de votre secteur :",
};
