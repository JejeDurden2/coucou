import { Controller, Get, Header, Query } from '@nestjs/common';

import { LoggerService } from '../../../../common/logger';
import { PrismaService } from '../../../../prisma';
import { UnsubscribeTokenService } from '../services/unsubscribe-token.service';
import { renderUnsubscribePage } from '../templates/unsubscribe-page.template';

@Controller('email')
export class UnsubscribeController {
  constructor(
    private readonly logger: LoggerService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly prisma: PrismaService,
  ) {
    this.logger.setContext(UnsubscribeController.name);
  }

  @Get('unsubscribe')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async unsubscribe(@Query('token') token: string): Promise<string> {
    const INVALID_LINK_PAGE = renderUnsubscribePage(
      'Lien invalide',
      'Le lien de désabonnement est invalide ou a expiré.',
      false,
    );

    if (!token) {
      return INVALID_LINK_PAGE;
    }

    const result = this.unsubscribeTokenService.verifyToken(token);

    if (!result) {
      this.logger.warn('Invalid unsubscribe token attempt');
      return INVALID_LINK_PAGE;
    }

    try {
      await this.prisma.user.update({
        where: { id: result.userId },
        data: { emailNotificationsEnabled: false },
      });

      this.logger.info('User unsubscribed from emails', { userId: result.userId });

      return renderUnsubscribePage(
        'Vous êtes désabonné',
        "Vous ne recevrez plus d'emails de notification de notre part.",
        true,
      );
    } catch (error) {
      this.logger.error('Failed to unsubscribe user', error instanceof Error ? error : undefined, {
        userId: result.userId,
      });

      return renderUnsubscribePage(
        'Erreur',
        'Une erreur est survenue lors du désabonnement. Veuillez réessayer plus tard.',
        false,
      );
    }
  }
}
