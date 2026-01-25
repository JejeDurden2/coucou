import { DomainError } from '../../../../common';

export class InvalidEmailFormatError extends DomainError {
  readonly code = 'INVALID_EMAIL_FORMAT';
  readonly statusCode = 400;

  constructor(email: string) {
    super('Invalid email format', { email });
  }
}

export class InvalidEmailDomainError extends DomainError {
  readonly code = 'INVALID_EMAIL_DOMAIN';
  readonly statusCode = 400;

  constructor(domain: string) {
    super('Email domain has no valid mail server', { domain });
  }
}

export class DisposableEmailError extends DomainError {
  readonly code = 'DISPOSABLE_EMAIL_NOT_ALLOWED';
  readonly statusCode = 400;

  constructor(domain: string) {
    super('Disposable email addresses are not allowed', { domain });
  }
}

export type EmailValidationError =
  | InvalidEmailFormatError
  | InvalidEmailDomainError
  | DisposableEmailError;
