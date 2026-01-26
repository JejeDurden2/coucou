/**
 * Email design tokens matching the web app
 * Based on globals.css and tailwind.config.ts
 */
export const EMAIL_COLORS = {
  background: '#09090b', // zinc-950
  card: '#18181b', // zinc-900
  cardHover: '#27272a', // zinc-800
  primary: '#8B5CF6', // violet-500
  primaryMuted: 'rgba(139, 92, 246, 0.12)', // primary/12
  text: '#fafafa', // zinc-50
  textMuted: '#a1a1aa', // zinc-400
  border: '#27272a', // zinc-800
  success: '#22c55e', // green-500
  successMuted: 'rgba(34, 197, 94, 0.1)', // success/10
  destructive: '#ef4444', // red-500
  warning: '#fbbf24', // amber-400
} as const;

export interface BaseEmailData {
  previewText?: string;
}

// Logo hosted on the website (SVG not supported by most email clients, use PNG)
const LOGO_URL = 'https://coucou-ia.com/logo-email.png';

/**
 * Wraps email content in the base template with Coucou IA branding
 */
export function wrapInBaseTemplate(content: string, data?: BaseEmailData): string {
  const previewText = data?.previewText ?? '';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Coucou IA</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; padding: 0; }
    a { color: ${EMAIL_COLORS.primary}; }
    @media (prefers-color-scheme: dark) {
      body { background-color: ${EMAIL_COLORS.background} !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${EMAIL_COLORS.background}; color: ${EMAIL_COLORS.text};">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
    ${'&nbsp;'.repeat(100)}
  </div>

  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${EMAIL_COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 560px; width: 100%; border-collapse: collapse;">
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 8px;">
                    <img src="${LOGO_URL}" alt="Coucou IA" width="32" height="32" style="display: block;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 20px; font-weight: 700; color: ${EMAIL_COLORS.text};">Coucou IA</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: ${EMAIL_COLORS.card}; border-radius: 12px; border: 1px solid ${EMAIL_COLORS.border};">
                <tr>
                  <td style="padding: 32px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p style="margin: 0; font-size: 13px; color: ${EMAIL_COLORS.textMuted}; line-height: 1.5;">
                Coucou IA- Votre visibilité dans les IA<br>
                <a href="https://coucou-ia.com" style="color: ${EMAIL_COLORS.textMuted}; text-decoration: underline;">coucou-ia.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

/**
 * Creates a primary CTA button
 */
export function createButton(text: string, href: string): string {
  return `
<table role="presentation" style="width: 100%; border-collapse: collapse;">
  <tr>
    <td align="center" style="padding: 8px 0;">
      <a href="${href}" style="display: inline-block; padding: 12px 24px; background-color: ${EMAIL_COLORS.primary}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`.trim();
}

/**
 * Creates an info box with left accent
 */
export function createInfoBox(
  content: string,
  variant: 'primary' | 'success' | 'warning' = 'primary',
): string {
  const colors = {
    primary: { bg: EMAIL_COLORS.primaryMuted, accent: EMAIL_COLORS.primary },
    success: { bg: EMAIL_COLORS.successMuted, accent: EMAIL_COLORS.success },
    warning: { bg: 'rgba(251, 191, 36, 0.1)', accent: EMAIL_COLORS.warning },
  };
  const { bg, accent } = colors[variant];

  return `
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <tr>
    <td style="padding: 16px; background-color: ${bg}; border-radius: 8px; border-left: 4px solid ${accent};">
      ${content}
    </td>
  </tr>
</table>
`.trim();
}

/**
 * Creates a paragraph with consistent styling
 */
export function createParagraph(text: string, options?: { muted?: boolean }): string {
  const color = options?.muted ? EMAIL_COLORS.textMuted : EMAIL_COLORS.text;
  return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${color};">${text}</p>`;
}

/**
 * Creates a heading
 */
export function createHeading(text: string, level: 1 | 2 | 3 = 2): string {
  const sizes = { 1: '24px', 2: '18px', 3: '16px' };
  const margins = { 1: '0 0 24px', 2: '24px 0 12px', 3: '16px 0 8px' };

  return `<h${level} style="margin: ${margins[level]}; font-size: ${sizes[level]}; font-weight: 600; color: ${EMAIL_COLORS.text};">${text}</h${level}>`;
}
