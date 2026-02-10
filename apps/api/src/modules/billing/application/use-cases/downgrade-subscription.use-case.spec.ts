import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Plan, SubscriptionStatus } from '@prisma/client';
import type { Subscription } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { DowngradeSubscriptionUseCase } from './downgrade-subscription.use-case';
import { Result } from '../../../../common/utils/result';
import { NotFoundError, ExternalServiceError } from '../../../../common/errors/domain-error';
import {
  AlreadyOnFreePlanError,
  NoActiveSubscriptionError,
  SubscriptionAlreadyCancelingError,
  SubscriptionNotActiveError,
} from '../../domain/errors/billing.errors';
import { User } from '../../../auth/domain/entities/user.entity';
import type { UserRepository } from '../../../auth/domain/repositories/user.repository';
import type { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import type { StripePort } from '../../domain/ports/stripe.port';
import type { EmailQueueService } from '../../../../infrastructure/queue';

const now = new Date('2026-01-01T00:00:00Z');

function mockUser(overrides: { id?: string; email?: string; name?: string; plan?: Plan } = {}): User {
  return User.from({
    id: overrides.id ?? 'user-123',
    email: overrides.email ?? 'test@example.com',
    name: overrides.name ?? 'Test User',
    password: null,
    googleId: null,
    avatarUrl: null,
    plan: overrides.plan ?? Plan.SOLO,
    stripeCustomerId: null,
    emailNotificationsEnabled: true,
    createdAt: now,
    updatedAt: now,
  });
}

function mockSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub-123',
    userId: 'user-123',
    stripeSubscriptionId: 'stripe-sub-123',
    status: SubscriptionStatus.ACTIVE,
    plan: Plan.SOLO,
    currentPeriodStart: now,
    currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('DowngradeSubscriptionUseCase', () => {
  let useCase: DowngradeSubscriptionUseCase;
  let mockUserRepository: Partial<UserRepository>;
  let mockSubscriptionRepository: Partial<SubscriptionRepository>;
  let mockStripePort: Partial<StripePort>;
  let mockEmailQueueService: Partial<EmailQueueService>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
    };

    mockSubscriptionRepository = {
      findByUserId: vi.fn(),
      update: vi.fn(),
    };

    mockStripePort = {
      cancelAtPeriodEnd: vi.fn(),
    };

    mockEmailQueueService = {
      addJob: vi.fn().mockResolvedValue(undefined),
    };

    mockConfigService = {
      get: vi.fn().mockReturnValue('https://coucou-ia.com'),
    };

    useCase = new DowngradeSubscriptionUseCase(
      mockUserRepository as UserRepository,
      mockSubscriptionRepository as SubscriptionRepository,
      mockStripePort as StripePort,
      mockEmailQueueService as EmailQueueService,
      mockConfigService as ConfigService,
    );
  });

  describe('execute', () => {
    it('should return error if user not found', async () => {
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(null);

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotFoundError);
        expect(result.error.message).toContain('user-123');
      }
    });

    it('should return error if user is already on FREE plan', async () => {
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser({ plan: Plan.FREE }));

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AlreadyOnFreePlanError);
      }
    });

    it('should return error if no subscription found', async () => {
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser());
      vi.mocked(mockSubscriptionRepository.findByUserId!).mockResolvedValue(null);

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NoActiveSubscriptionError);
      }
    });

    it('should return error if subscription is not active', async () => {
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser());
      vi.mocked(mockSubscriptionRepository.findByUserId!).mockResolvedValue(
        mockSub({ status: SubscriptionStatus.CANCELED }),
      );

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(SubscriptionNotActiveError);
      }
    });

    it('should return error if subscription already pending cancellation', async () => {
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser());
      vi.mocked(mockSubscriptionRepository.findByUserId!).mockResolvedValue(
        mockSub({ cancelAtPeriodEnd: true }),
      );

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(SubscriptionAlreadyCancelingError);
      }
    });

    it('should return error if Stripe API fails', async () => {
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser());
      vi.mocked(mockSubscriptionRepository.findByUserId!).mockResolvedValue(mockSub());
      vi.mocked(mockStripePort.cancelAtPeriodEnd!).mockResolvedValue(
        Result.err(new ExternalServiceError('Stripe', 'Payment service unavailable')),
      );

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ExternalServiceError);
      }
    });

    it('should successfully downgrade SOLO subscription', async () => {
      const periodEnd = new Date('2026-02-15T00:00:00Z');
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser());
      vi.mocked(mockSubscriptionRepository.findByUserId!).mockResolvedValue(mockSub());
      vi.mocked(mockStripePort.cancelAtPeriodEnd!).mockResolvedValue(
        Result.ok({
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: true,
        }),
      );
      vi.mocked(mockSubscriptionRepository.update!).mockResolvedValue(
        mockSub({ cancelAtPeriodEnd: true }),
      );

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.success).toBe(true);
        expect(result.value.currentPlan).toBe(Plan.SOLO);
        expect(result.value.effectiveDate).toBe(periodEnd.toISOString());
        expect(result.value.message).toContain('15 février 2026');
        expect(result.value.message).toContain('SOLO');
      }

      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith('sub-123', {
        cancelAtPeriodEnd: true,
      });
    });

    it('should successfully downgrade PRO subscription', async () => {
      const periodEnd = new Date('2026-03-20T00:00:00Z');
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(
        mockUser({ id: 'user-456', email: 'pro@example.com', name: 'Pro User', plan: Plan.PRO }),
      );
      vi.mocked(mockSubscriptionRepository.findByUserId!).mockResolvedValue(
        mockSub({
          id: 'sub-456',
          userId: 'user-456',
          stripeSubscriptionId: 'stripe-sub-456',
          plan: Plan.PRO,
        }),
      );
      vi.mocked(mockStripePort.cancelAtPeriodEnd!).mockResolvedValue(
        Result.ok({
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: true,
        }),
      );
      vi.mocked(mockSubscriptionRepository.update!).mockResolvedValue(
        mockSub({ id: 'sub-456', cancelAtPeriodEnd: true }),
      );

      const result = await useCase.execute({ userId: 'user-456' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.success).toBe(true);
        expect(result.value.currentPlan).toBe(Plan.PRO);
        expect(result.value.effectiveDate).toBe(periodEnd.toISOString());
        expect(result.value.message).toContain('20 mars 2026');
        expect(result.value.message).toContain('PRO');
      }
    });

    it('should format effectiveDate as ISO 8601', async () => {
      const periodEnd = new Date('2026-02-15T12:34:56Z');
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser());
      vi.mocked(mockSubscriptionRepository.findByUserId!).mockResolvedValue(mockSub());
      vi.mocked(mockStripePort.cancelAtPeriodEnd!).mockResolvedValue(
        Result.ok({
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: true,
        }),
      );

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.effectiveDate).toBe('2026-02-15T12:34:56.000Z');
      }
    });

    it('should include French message with formatted date', async () => {
      const periodEnd = new Date('2026-12-25T00:00:00Z');
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser());
      vi.mocked(mockSubscriptionRepository.findByUserId!).mockResolvedValue(mockSub());
      vi.mocked(mockStripePort.cancelAtPeriodEnd!).mockResolvedValue(
        Result.ok({
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: true,
        }),
      );

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('25 décembre 2026');
        expect(result.value.message).toContain('Votre abonnement sera annulé');
        expect(result.value.message).toContain("Vous conservez l'accès aux fonctionnalités SOLO");
      }
    });
  });
});
