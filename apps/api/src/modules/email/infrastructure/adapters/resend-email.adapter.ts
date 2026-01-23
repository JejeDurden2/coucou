import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { ExternalServiceError } from '../../../../common';
import type { EmailPort, SendEmailOptions } from '../../application/ports/email.port';

@Injectable()
export class ResendEmailAdapter implements EmailPort {
  private readonly logger = new Logger(ResendEmailAdapter.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly apiKey: string | undefined;

  constructor(@Optional() private readonly configService?: ConfigService) {
    this.apiKey = configService?.get<string>('RESEND_API_KEY') ?? process.env.RESEND_API_KEY;
    if (!this.apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - emails will be logged only');
    }
    this.resend = new Resend(this.apiKey);
    this.fromEmail =
      configService?.get<string>('EMAIL_FROM') ??
      process.env.EMAIL_FROM ??
      'Coucou <noreply@coucou-ia.com>';
  }

  async send(options: SendEmailOptions): Promise<void> {
    if (!this.apiKey) {
      this.logger.log(`[DEV] Email would be sent to ${options.to}: ${options.subject}`);
      this.logger.debug(`[DEV] Email content: ${options.text ?? options.html}`);
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (result.error) {
        this.logger.error(`Failed to send email to ${options.to}`);
        throw new ExternalServiceError('Resend', 'Email service unavailable');
      }

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }
}
