// Page d'erreur runtime (app/error.tsx). Même ton que la 404 : bref, honnête.

import { contactEmail } from "@/content/site";

export const errorPage = {
  accroche: "Erreur",
  headline: "Coucou. Quelque chose a cassé de notre côté.",
  sub: `Rechargez la page. Si ça persiste, écrivez-nous : ${contactEmail}.`,
  retryLabel: "Recharger la page",
  homeLabel: "Retour à l’accueil",
};
