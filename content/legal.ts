// Pages légales : mentions légales et confidentialité. Ton sobre, aucun clin d'oeil.
// TODO fondateur : faire relire ces deux pages par un juriste avant la mise en ligne.

import { contactEmail } from "@/content/site";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalPage = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

export const mentionsLegales: LegalPage = {
  title: "Mentions légales",
  updated: "18 juillet 2026",
  sections: [
    {
      heading: "Éditeur du site",
      paragraphs: [
        "COUCOU IA, société par actions simplifiée (SAS) au capital de 500 €.",
        "Siège social : 460 avenue de Pessicart, 06100 Nice, France.",
        "SIREN : 100 498 070. SIRET du siège : 100 498 070 00018.",
        "TVA intracommunautaire : FR83 100 498 070.",
        "Immatriculée au Registre national des entreprises (RNE) tenu par l'INPI.",
        "Code NAF : 58.29C (édition de logiciels applicatifs).",
        `Contact : ${contactEmail}.`,
      ],
    },
    {
      heading: "Directeur de la publication",
      // TODO fondateur : nommer explicitement le directeur de la publication si souhaité.
      paragraphs: ["Le représentant légal de la société COUCOU IA."],
    },
    {
      heading: "Hébergement",
      paragraphs: [
        "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.",
        "Site de l'hébergeur : vercel.com.",
      ],
    },
    {
      heading: "Propriété intellectuelle",
      paragraphs: [
        "L'ensemble des contenus de ce site (textes, éléments graphiques, marque « Coucou IA ») est la propriété de COUCOU IA, sauf mention contraire. Toute reproduction sans autorisation préalable est interdite.",
      ],
    },
    {
      heading: "Responsabilité",
      paragraphs: [
        "COUCOU IA s'efforce de tenir les informations de ce site à jour, sans garantir leur exactitude ni leur exhaustivité. Le contenu peut évoluer à tout moment.",
      ],
    },
  ],
};

export const confidentialite: LegalPage = {
  title: "Politique de confidentialité",
  updated: "18 juillet 2026",
  sections: [
    {
      heading: "En résumé",
      paragraphs: [
        "Ce site est une vitrine. Il ne dépose aucun cookie, n'utilise aucun outil de mesure d'audience et ne collecte aucune donnée à votre insu. Vous le consultez, rien n'est enregistré de votre côté.",
      ],
    },
    {
      heading: "Cookies et mesure d'audience",
      paragraphs: [
        "Aucun. Pas de cookie de suivi, pas d'outil d'analytics, pas de traceur publicitaire. Aucun bandeau de consentement ne vous est demandé, parce qu'il n'y a rien à consentir.",
      ],
    },
    {
      heading: "Données que vous nous transmettez",
      paragraphs: [
        "Si vous nous écrivez pour réserver un diagnostic ou poser une question, nous recevons les informations que vous choisissez de nous communiquer (nom, adresse e-mail, message).",
        "Ces données servent uniquement à vous répondre et à organiser l'échange. Nous ne les utilisons à aucune autre fin et ne les revendons jamais.",
        "Elles sont conservées le temps nécessaire au traitement de votre demande, puis supprimées ou archivées conformément à nos obligations légales.",
      ],
    },
    {
      heading: "Vos droits",
      paragraphs: [
        `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition sur vos données. Pour l'exercer, écrivez-nous à ${contactEmail}.`,
        "Vous pouvez aussi introduire une réclamation auprès de la CNIL (cnil.fr).",
      ],
    },
    {
      heading: "Hébergement et journaux techniques",
      paragraphs: [
        "Le site est hébergé par Vercel Inc. (États-Unis). L'hébergeur peut traiter des données techniques de connexion (journaux serveur) à des fins de sécurité et de bon fonctionnement, sans que COUCOU IA n'exploite ces données à des fins de suivi.",
      ],
    },
    {
      heading: "Évolution de cette politique",
      paragraphs: [
        "Si le site venait à intégrer un formulaire, un outil de réservation ou une mesure d'audience, cette politique serait mise à jour avant toute nouvelle collecte.",
      ],
    },
  ],
};
