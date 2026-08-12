// FAQ issue des objections + anti-persona + prix. Questions formulées comme un dirigeant les pose.
// Pas de clin d’oeil dans les réponses prix et sécurité : tout est sobre.

export type FaqItem = {
  question: string;
  answer: string;
  // Lien optionnel affiché sous la réponse (jamais un CTA, juste une page à lire).
  link?: { label: string; href: string };
};

export type FaqSection = {
  title: string;
  sub: string;
  items: FaqItem[];
};

export const faq: FaqSection = {
  title: "Les questions qu’on nous pose vraiment.",
  sub: "Ce qu’un dirigeant nous demande avant de réserver. Réponses directes, sans détour.",
  items: [
    {
      question: "L’IA, est-ce vraiment pour une entreprise comme la nôtre ?",
      answer:
        "L’IA n’est pas réservée aux géants de la tech. On commence par un premier échange gratuit qui identifie des cas d’usage concrets dans votre activité. Et si l’IA n’apporte rien chez vous, on vous le dit franchement.",
    },
    {
      question: "Combien ça coûte ?",
      answer:
        "Le tarif dépend du périmètre, découvert lors de ce premier échange. On ne publie pas de prix : un prix sans périmètre ne veut rien dire. Vous recevez un business case chiffré avant tout engagement, donc vous voyez le retour attendu avant de décider.",
    },
    {
      question: "Combien de temps avant un premier résultat ?",
      answer:
        "Trois semaines pour le premier agent : un seul cas d’usage, cadré lors du point de départ, mis en production avec validation humaine sur les actions sensibles, puis un mois d’ajustements. Le périmètre est petit, c’est voulu : un résultat visible vite vaut mieux qu’un chantier qui traîne.",
    },
    {
      question: "Comment nos données sont-elles protégées ?",
      answer:
        "On conçoit dès le départ dans le respect du RGPD et de l’AI Act. Vos données restent sous votre contrôle : hébergement adapté, pas de fuite vers des modèles publics sans votre accord. La souveraineté des données est un point de départ, pas une option.",
    },
    {
      question:
        "On a déjà testé ChatGPT et ça n’a rien changé. En quoi c’est différent ?",
      answer:
        "ChatGPT tout seul, c’est un outil individuel, pas un système d’entreprise. La valeur arrive quand l’IA est branchée sur vos données et vos process, en production, et mesurée. Notre métier, ce n’est pas le prompt, c’est le système.",
    },
    {
      question:
        "On entend beaucoup parler d’OpenClaw et de Hermes Agent. Faut-il les installer ?",
      answer:
        "Oui, on les installe aussi, cadrés et sécurisés. Brancher chez vous un outil qui exécute des commandes et lit vos fichiers demande des garde-fous : sécurité, RGPD, supervision. On pose d’abord le business case, puis on déploie celui qui se justifie chez vous. Parfois, la réponse est aucun des deux.",
      link: {
        label: "OpenClaw, Hermes Agent : le décryptage",
        href: "/agents-ia",
      },
    },
    {
      question: "On a déjà été échaudés par un POC qui n’a jamais abouti.",
      answer:
        "C’est justement pour ça qu’on existe. On ne livre pas un POC de démo, on livre un système en production, mesuré sur ses résultats. Un prototype qui reste au labo, pour nous, ce n’est pas un livrable.",
    },
    {
      question: "On n’a personne en interne pour piloter un projet IA.",
      answer:
        "C’est notre rôle, pas le vôtre. On pilote de bout en bout, on s’intègre à vos outils existants et on documente ce qu’on livre. Vos équipes utilisent le système sans avoir à monter une équipe data.",
    },
    {
      question: "Qui travaille concrètement sur notre projet ?",
      answer:
        "La même personne du premier appel à la mise en production : celle qui conçoit la stratégie écrit aussi le code. Pas de junior intercalé, pas de sous-traitance, rien ne se perd entre l’audit et le système.",
    },
    {
      question: "Une structure d’une personne, ce n’est pas un risque ?",
      answer:
        "La question est légitime, la réponse est double : documenté, et suivi. Tout ce qu’on livre est documenté et intégré à vos outils : le système vous appartient, tourne chez vous et ne dépend pas de nous pour fonctionner. Le suivi mensuel fait le reste : quelqu’un surveille le système, le corrige et le fait évoluer. Et si Coucou IA s’arrête demain, votre système continue, et n’importe quel développeur peut le reprendre avec la documentation.",
    },
    {
      question: "Pour qui n’est-ce PAS fait ?",
      answer:
        "Pas pour les grands comptes aux cycles d’achat interminables, ni pour les jeunes pousses sans premier euro de chiffre d’affaires qui cherchent un CTO. Si vous voulez juste une démo sans intention de déployer, ou le prestataire le moins cher sans regarder le résultat, on ne sera pas le bon partenaire. On travaille avec des PME qui ont de vrais process à améliorer.",
    },
  ],
};
