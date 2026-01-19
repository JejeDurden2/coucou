export { EmailModule } from './email.module';
export { EMAIL_PORT, type EmailPort, type SendEmailOptions } from './application/ports/email.port';
export {
  generateWelcomeEmail,
  type WelcomeEmailData,
} from './infrastructure/templates/welcome.template';
export {
  generatePasswordResetEmail,
  type PasswordResetEmailData,
} from './infrastructure/templates/password-reset.template';
