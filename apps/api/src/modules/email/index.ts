export { EmailModule } from './email.module';
export { EMAIL_PORT, type EmailPort, type SendEmailOptions } from './application/ports/email.port';
export {
  generateWelcomeEmail,
  type WelcomeEmailData,
} from './infrastructure/templates/welcome.template';
