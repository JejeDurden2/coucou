import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import type { EmailPort, SendEmailOptions } from '../../application/ports/email.port';

@Injectable()
export class ResendEmailAdapter implements EmailPort {
  private readonly logger = new Logger(ResendEmailAdapter.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured - emails will be logged only');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'Coucou <noreply@coucou-ia.com>');
  }

  async send(options: SendEmailOptions): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
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
        this.logger.error(`Failed to send email to ${options.to}: ${result.error.message}`);
        throw new Error(result.error.message);
      }

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }
}
