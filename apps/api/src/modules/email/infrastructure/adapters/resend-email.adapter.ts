import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { ExternalServiceError, LoggerService } from '../../../../common';
import type { EmailPort, SendEmailOptions } from '../../application/ports/email.port';

@Injectable()
export class ResendEmailAdapter implements EmailPort {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly apiKey: string | undefined;

  constructor(
    private readonly logger: LoggerService,
    @Optional() private readonly configService?: ConfigService,
  ) {
    this.logger.setContext(ResendEmailAdapter.name);
    this.apiKey = configService?.get<string>('RESEND_API_KEY') ?? process.env.RESEND_API_KEY;
    if (!this.apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - emails will be logged only');
    }
    this.resend = new Resend(this.apiKey);
    this.fromEmail =
      configService?.get<string>('EMAIL_FROM') ??
      process.env.EMAIL_FROM ??
      'Coucou IA <jerome@coucou-ia.com>';
  }

  async send(options: SendEmailOptions): Promise<void> {
    if (!this.apiKey) {
      this.logger.info('[DEV] Email would be sent', {
        to: options.to,
        subject: options.subject,
        attachmentCount: options.attachments?.length ?? 0,
      });
      this.logger.debug('[DEV] Email content', { content: options.text ?? options.html });
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.attachments?.length && {
          attachments: options.attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
          })),
        }),
      });

      if (result.error) {
        this.logger.error('Failed to send email', { to: options.to });
        throw new ExternalServiceError('Resend', 'Email service unavailable');
      }

      this.logger.info('Email sent', { to: options.to, subject: options.subject });
    } catch (error) {
      this.logger.error('Failed to send email', error instanceof Error ? error : undefined, {
        to: options.to,
      });
      throw error;
    }
  }
}
