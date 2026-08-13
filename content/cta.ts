// CTA final. Clin d’oeil autorisé dans le titre. Le libellé du bouton vient de site.ts (ctaLabel).

export type FinalCta = {
  title: string;
  sub: string;
  // Sortie douce : le lecteur pas prêt pour un appel laisse un email via les cartes.
  softExitIntro: string;
  // Repli des secteurs sans carte : le kit de démarrage, valable pour tous.
  softExitKitIntro: string;
  softExitKitLabel: string;
};

export const finalCta: FinalCta = {
  title: "Coucou. On regarde ce que l’IA rend possible chez vous ?",
  sub: "30 minutes, gratuites et sans engagement. Vous repartez avec un avis franc et vos premières pistes : où l’IA rapporte chez vous, et où elle ne sert à rien.",
  softExitIntro: "Pas prêt pour un appel ? Ouvrez la carte des possibles de votre secteur :",
  softExitKitIntro: "Pas prêt pour un appel ? Commencez par un outil gratuit :",
  softExitKitLabel: "Le kit de démarrage",
};
