export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      ...(this.metadata && { details: this.metadata }),
    };
  }
}

// ============================================
// Common Domain Errors
// ============================================

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`, { resource, id });
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(errors: string[]) {
    super('Validation failed', { errors });
  }
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;

  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} "${value}" already exists`, {
      resource,
      field,
      value,
    });
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;

  constructor(message = 'Authentication required') {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;

  constructor(message = 'Access denied') {
    super(message);
  }
}

export class PlanLimitError extends DomainError {
  readonly code = 'PLAN_LIMIT_EXCEEDED';
  readonly statusCode = 403;

  constructor(resource: string, limit: number, plan: string) {
    super(`Plan limit exceeded: ${resource} limit is ${limit} for ${plan} plan`, {
      resource,
      limit,
      plan,
    });
  }
}
