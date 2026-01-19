export interface WelcomeEmailData {
  userName: string;
  loginUrl: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): { html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Coucou</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #18181b;">
                Bienvenue sur Coucou
              </h1>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                Bonjour ${data.userName},
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                Merci de rejoindre Coucou ! Vous venez de faire un premier pas important vers une meilleure visibilite de votre marque dans les reponses des IA.
              </p>

              <!-- Key points -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="padding: 16px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #18181b;">
                      Pourquoi c'est important ?
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #3f3f46; font-size: 14px; line-height: 1.8;">
                      <li><strong>40% des recherches</strong> passent desormais par les IA (ChatGPT, Claude...)</li>
                      <li>Les utilisateurs font confiance aux recommandations de l'IA</li>
                      <li>Etre cite = plus de visibilite et de conversions</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- What to do next -->
              <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #18181b;">
                Premiers pas :
              </p>
              <ol style="margin: 0 0 30px; padding-left: 20px; color: #3f3f46; font-size: 14px; line-height: 2;">
                <li>Creez votre premier projet avec votre nom de marque</li>
                <li>Ajoutez des prompts que vos clients pourraient poser</li>
                <li>Lancez un scan pour voir si vous etes cite</li>
                <li>Suivez vos recommandations pour ameliorer votre visibilite</li>
              </ol>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${data.loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Acceder a mon dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center;">
                Des questions ? Repondez directement a cet email.<br>
                L'equipe Coucou
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

  const text = `
Bienvenue sur Coucou !

Bonjour ${data.userName},

Merci de rejoindre Coucou ! Vous venez de faire un premier pas important vers une meilleure visibilite de votre marque dans les reponses des IA.

POURQUOI C'EST IMPORTANT ?
- 40% des recherches passent desormais par les IA (ChatGPT, Claude...)
- Les utilisateurs font confiance aux recommandations de l'IA
- Etre cite = plus de visibilite et de conversions

PREMIERS PAS :
1. Creez votre premier projet avec votre nom de marque
2. Ajoutez des prompts que vos clients pourraient poser
3. Lancez un scan pour voir si vous etes cite
4. Suivez vos recommandations pour ameliorer votre visibilite

Accedez a votre dashboard : ${data.loginUrl}

Des questions ? Repondez directement a cet email.
L'equipe Coucou
`.trim();

  return { html, text };
}
