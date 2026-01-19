export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailPort {
  send(options: SendEmailOptions): Promise<void>;
}

export const EMAIL_PORT = Symbol('EMAIL_PORT');
