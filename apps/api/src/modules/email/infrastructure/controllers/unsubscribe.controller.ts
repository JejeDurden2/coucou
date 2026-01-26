import { Controller, Get, Header, Logger, Query } from '@nestjs/common';

import { PrismaService } from '../../../../prisma';
import { UnsubscribeTokenService } from '../services/unsubscribe-token.service';

@Controller('email')
export class UnsubscribeController {
  private readonly logger = new Logger(UnsubscribeController.name);

  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('unsubscribe')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async unsubscribe(@Query('token') token: string): Promise<string> {
    if (!token) {
      return this.renderPage(
        'Lien invalide',
        'Le lien de désabonnement est invalide ou a expiré.',
        false,
      );
    }

    const result = this.unsubscribeTokenService.verifyToken(token);

    if (!result) {
      this.logger.warn('Invalid unsubscribe token attempt');
      return this.renderPage(
        'Lien invalide',
        'Le lien de désabonnement est invalide ou a expiré.',
        false,
      );
    }

    try {
      await this.prisma.user.update({
        where: { id: result.userId },
        data: { emailNotificationsEnabled: false },
      });

      this.logger.log({
        message: 'User unsubscribed from emails',
        userId: result.userId,
      });

      return this.renderPage(
        'Vous êtes désabonné',
        "Vous ne recevrez plus d'emails de notification de notre part.",
        true,
      );
    } catch (error) {
      this.logger.error({
        message: 'Failed to unsubscribe user',
        userId: result.userId,
        error: error instanceof Error ? error.message : String(error),
      });

      return this.renderPage(
        'Erreur',
        'Une erreur est survenue lors du désabonnement. Veuillez réessayer plus tard.',
        false,
      );
    }
  }

  private renderPage(title: string, message: string, success: boolean): string {
    const iconColor = success ? '#22c55e' : '#ef4444';
    const icon = success
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Coucou IA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #09090b;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background-color: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 48px;
      max-width: 400px;
      text-align: center;
    }
    .icon { color: ${iconColor}; margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 12px; }
    p { color: #a1a1aa; font-size: 15px; line-height: 1.6; }
    .logo { margin-top: 32px; color: #a1a1aa; font-size: 14px; }
    .logo a { color: #8B5CF6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="logo">
      <a href="https://coucou-ia.com">Coucou IA</a> - Votre visibilité dans les IA
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
