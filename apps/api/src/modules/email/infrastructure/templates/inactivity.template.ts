import { wrapInBaseTemplate, createButton, createParagraph, createHeading } from './base.template';

export interface InactivityEmailData {
  userName: string;
  brandName: string;
  lastScanDate: string;
  daysSinceLastScan: number;
  dashboardUrl: string;
}

export function generateInactivityEmail(data: InactivityEmailData): { html: string; text: string } {
  const content = `
    ${createHeading(`${data.brandName} : dernier scan il y a ${data.daysSinceLastScan} jours`, 1)}

    ${createParagraph(`Bonjour ${data.userName},`)}

    ${createParagraph(`Votre projet <strong>${data.brandName}</strong> n'a pas été scanné depuis le ${data.lastScanDate}.`)}

    ${createParagraph(`Les réponses des IA évoluent régulièrement. Un nouveau scan vous permettra de voir si votre positionnement a changé.`)}

    ${createButton('Lancer un scan', data.dashboardUrl)}
  `;

  const html = wrapInBaseTemplate(content, {
    previewText: `${data.brandName} : dernier scan il y a ${data.daysSinceLastScan} jours.`,
  });

  const text = `
${data.brandName} : dernier scan il y a ${data.daysSinceLastScan} jours

Bonjour ${data.userName},

Votre projet ${data.brandName} n'a pas été scanné depuis le ${data.lastScanDate}.

Les réponses des IA évoluent régulièrement. Un nouveau scan vous permettra de voir si votre positionnement a changé.

Lancer un scan : ${data.dashboardUrl}

--
Coucou - Votre visibilité dans les IA
https://coucou-ia.com
`.trim();

  return { html, text };
}
