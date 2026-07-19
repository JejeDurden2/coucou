// Les 4 étapes. Chaque étape rend la garantie crédible : on chiffre avant, on livre, on mesure.

export type MethodStep = {
  number: string;
  title: string;
  description: string;
  detail: string;
};

export type MethodSection = {
  title: string;
  sub: string;
  steps: MethodStep[];
};

export const method: MethodSection = {
  title: "De l'intuition floue au système qui tourne.",
  sub: "Quatre étapes. Chacune conçue pour dérisquer la suivante. À la fin, vous savez exactement ce que l'IA vous rapporte.",
  steps: [
    {
      number: "01",
      title: "Diagnostic",
      description:
        "On démarre par 30 minutes, gratuites et sans engagement. On regarde votre activité et on repère où l'IA peut vraiment vous faire gagner du temps ou de l'argent. Si rien ne tient la route chez vous, on vous le dit.",
      detail: "30 minutes, gratuit, sans engagement.",
    },
    {
      number: "02",
      title: "Business case chiffré",
      description:
        "Avant le moindre développement, on chiffre le retour attendu. Vous voyez le gain estimé, le périmètre et le coût. Vous décidez sur des chiffres, pas sur une promesse.",
      detail: "Le retour attendu, avant d'engager.",
    },
    {
      number: "03",
      title: "Déploiement en production",
      description:
        "On construit le système et on le met en service dans vos outils. Pas un prototype qui reste au labo : quelque chose que vos équipes utilisent pour de vrai. Intégré, sécurisé, documenté.",
      detail: "En production, pas au labo.",
    },
    {
      number: "04",
      title: "Mesure du ROI",
      description:
        "Une fois en service, on mesure les résultats réels face au business case de départ. Temps gagné, coûts réduits, chiffres à l'appui. C'est là que l'engagement se vérifie.",
      detail: "Résultats réels, comparés au business case.",
    },
  ],
};
