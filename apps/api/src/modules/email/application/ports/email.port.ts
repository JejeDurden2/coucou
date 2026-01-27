export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export interface EmailPort {
  send(options: SendEmailOptions): Promise<void>;
}

export const EMAIL_PORT = Symbol('EMAIL_PORT');
