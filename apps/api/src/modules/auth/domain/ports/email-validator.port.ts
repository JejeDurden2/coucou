import type { Result } from '../../../../common';
import type { EmailValidationError } from '../errors/email-validation.error';

export const EMAIL_VALIDATOR_PORT = Symbol('EMAIL_VALIDATOR_PORT');

export interface EmailValidatorPort {
  validate(email: string): Promise<Result<void, EmailValidationError>>;
}
