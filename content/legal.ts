// Pages légales : mentions légales et confidentialité. Ton sobre, aucun clin d’oeil.
// TODO fondateur : faire relire ces deux pages par un juriste avant la mise en ligne.

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
        "Immatriculée au Registre national des entreprises (RNE) tenu par l’INPI.",
        "Code NAF : 58.29C (édition de logiciels applicatifs).",
        `Contact : ${contactEmail}.`,
      ],
    },
    {
      heading: "Directeur de la publication",
      // TODO fondateur : nommer explicitement le directeur de la publication si souhaité.
      paragraphs: ["Le représentant légal de la société COUCOU IA."],
    },
    {
      heading: "Hébergement",
      paragraphs: [
        "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.",
        "Site de l’hébergeur : vercel.com.",
      ],
    },
    {
      heading: "Propriété intellectuelle",
      paragraphs: [
        "L’ensemble des contenus de ce site (textes, éléments graphiques, marque « Coucou IA ») est la propriété de COUCOU IA, sauf mention contraire. Toute reproduction sans autorisation préalable est interdite.",
      ],
    },
    {
      heading: "Responsabilité",
      paragraphs: [
        "COUCOU IA s’efforce de tenir les informations de ce site à jour, sans garantir leur exactitude ni leur exhaustivité. Le contenu peut évoluer à tout moment.",
      ],
    },
  ],
};

export const confidentialite: LegalPage = {
  title: "Politique de confidentialité",
  updated: "19 juillet 2026",
  sections: [
    {
      heading: "En résumé",
      paragraphs: [
        "Ce site ne dépose aucun cookie et ne vous identifie pas individuellement. Il utilise une mesure d’audience sans cookie (statistiques agrégées et anonymes). Les seules données personnelles que nous recevons sont celles que vous choisissez de nous transmettre : votre adresse e-mail pour recevoir une ressource, ou vos coordonnées pour réserver un premier échange.",
      ],
    },
    {
      heading: "Cookies et mesure d’audience",
      paragraphs: [
        "Le site ne dépose aucun cookie de suivi ni traceur publicitaire. Aucun bandeau de consentement ne vous est demandé, parce qu’aucun cookie ne le nécessite.",
        "Nous utilisons Vercel Analytics, un outil de mesure d’audience sans cookie : il compte les pages vues de façon agrégée (page consultée, pays, type d’appareil) sans identifiant individuel ni suivi d’un site à l’autre. Ces statistiques ne permettent pas de vous identifier.",
      ],
    },
    {
      heading: "Données que vous nous transmettez",
      paragraphs: [
        "Si vous demandez une ressource (par exemple une carte des possibles), votre adresse e-mail sert à vous l’envoyer, puis à vous adresser quelques e-mails en lien avec cette ressource. Chaque e-mail contient un lien de désinscription en un clic. Ces envois passent par Lemlist (édité par lempire, société française), prestataire conforme au RGPD, qui traite votre adresse pour notre compte.",
        "Si vous réservez un premier échange, la prise de rendez-vous passe par l’outil Cal.com, qui recueille les informations que vous renseignez (nom, e-mail, réponses au formulaire de réservation) pour organiser cet échange.",
        "Si vous nous écrivez directement, nous recevons les informations que vous choisissez de nous communiquer (nom, adresse e-mail, message).",
        "Ces données servent uniquement à vous répondre, vous envoyer ce que vous avez demandé et organiser l’échange. Nous ne les utilisons à aucune autre fin et ne les revendons jamais.",
        "Elles sont conservées le temps nécessaire au traitement de votre demande, puis supprimées ou archivées conformément à nos obligations légales.",
      ],
    },
    {
      heading: "Sous-traitants",
      paragraphs: [
        "Vercel Inc. (États-Unis) : hébergement du site et mesure d’audience sans cookie.",
        "Lemlist, édité par lempire (France) : envoi des ressources par e-mail et gestion de la liste de contacts.",
        "Cal.com : prise de rendez-vous pour le premier échange.",
      ],
    },
    {
      heading: "Vos droits",
      paragraphs: [
        `Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement et d’opposition sur vos données. Pour l’exercer, écrivez-nous à ${contactEmail}.`,
        "Vous pouvez aussi introduire une réclamation auprès de la CNIL (cnil.fr).",
      ],
    },
    {
      heading: "Hébergement et journaux techniques",
      paragraphs: [
        "Le site est hébergé par Vercel Inc. (États-Unis). L’hébergeur peut traiter des données techniques de connexion (journaux serveur) à des fins de sécurité et de bon fonctionnement, sans que COUCOU IA n’exploite ces données à des fins de suivi.",
      ],
    },
    {
      heading: "Évolution de cette politique",
      paragraphs: [
        "Si les outils ou les collectes décrits ici évoluent, cette politique est mise à jour avant toute nouvelle collecte, avec sa date de révision.",
      ],
    },
  ],
};
