import { DomainError } from '../../../../common/errors/domain-error';

export class AlreadyOnFreePlanError extends DomainError {
  readonly code = 'ALREADY_ON_FREE_PLAN' as const;
  readonly statusCode = 400 as const;

  constructor() {
    super('Vous êtes déjà sur le plan gratuit');
  }
}

export class NoActiveSubscriptionError extends DomainError {
  readonly code = 'NO_ACTIVE_SUBSCRIPTION' as const;
  readonly statusCode = 400 as const;

  constructor() {
    super('Aucun abonnement actif trouvé');
  }
}

export class SubscriptionAlreadyCancelingError extends DomainError {
  readonly code = 'SUBSCRIPTION_ALREADY_CANCELING' as const;
  readonly statusCode = 400 as const;

  constructor() {
    super("Votre abonnement est déjà en cours d'annulation");
  }
}

export class SubscriptionNotActiveError extends DomainError {
  readonly code = 'SUBSCRIPTION_NOT_ACTIVE' as const;
  readonly statusCode = 400 as const;

  constructor() {
    super("L'abonnement n'est pas actif");
  }
}

export class SubscriptionNotPendingCancellationError extends DomainError {
  readonly code = 'SUBSCRIPTION_NOT_PENDING_CANCELLATION' as const;
  readonly statusCode = 400 as const;

  constructor() {
    super("L'abonnement n'est pas en cours d'annulation");
  }
}
