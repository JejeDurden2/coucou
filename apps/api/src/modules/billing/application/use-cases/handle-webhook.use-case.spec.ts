import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { Plan } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { HandleWebhookUseCase } from './handle-webhook.use-case';
import type { PrismaService } from '../../../../prisma';
import type { StripeService } from '../../infrastructure/stripe.service';
import type { EmailQueueService } from '../../../../infrastructure/queue';

describe('HandleWebhookUseCase', () => {
  let useCase: HandleWebhookUseCase;
  let mockPrisma: {
    user: { findFirst: Mock; update: Mock };
    subscription: { delete: Mock; upsert: Mock; update: Mock };
    $transaction: Mock;
  };
  let mockStripeService: Partial<StripeService>;
  let mockConfigService: Partial<ConfigService>;
  let mockEmailQueueService: Partial<EmailQueueService>;

  const createMockPrisma = () => {
    const mock = {
      user: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      subscription: {
        delete: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    };
    // Mock $transaction to execute all promises in the array
    mock.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );
    return mock;
  };

  beforeEach(() => {
    mockPrisma = createMockPrisma();

    mockStripeService = {
      constructWebhookEvent: vi.fn(),
      getSubscription: vi.fn(),
      getPlanFromPriceId: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn().mockReturnValue('https://coucou-ia.com'),
    };

    mockEmailQueueService = {
      addJob: vi.fn().mockResolvedValue(undefined),
    };

    useCase = new HandleWebhookUseCase(
      mockPrisma as unknown as PrismaService,
      mockStripeService as unknown as StripeService,
      mockConfigService as unknown as ConfigService,
      mockEmailQueueService as EmailQueueService,
    );
  });

  describe('customer.subscription.deleted', () => {
    const mockDeletedEvent = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_stripe_123',
          customer: 'cus_123',
          status: 'canceled',
          current_period_start: 1704067200,
          current_period_end: 1706745600,
          cancel_at_period_end: false,
          items: { data: [{ price: { id: 'price_solo' } }] },
        },
      },
    };

    it('should handle unknown user gracefully', async () => {
      (mockStripeService.constructWebhookEvent as Mock).mockReturnValue(mockDeletedEvent);
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await useCase.execute('payload', 'signature');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { stripeCustomerId: 'cus_123' },
      });
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      expect(mockEmailQueueService.addJob).not.toHaveBeenCalled();
    });

    it('should downgrade SOLO user to FREE and send email', async () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test User',
        plan: Plan.SOLO,
        stripeCustomerId: 'cus_123',
      };

      (mockStripeService.constructWebhookEvent as Mock).mockReturnValue(mockDeletedEvent);
      mockPrisma.user.findFirst.mockResolvedValue(user);
      mockPrisma.subscription.delete.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({ ...user, plan: Plan.FREE });

      await useCase.execute('payload', 'signature');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.subscription.delete).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { plan: Plan.FREE },
      });

      // Wait for non-blocking email
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockEmailQueueService.addJob).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'subscription-ended',
          to: 'test@test.com',
        }),
      );
    });

    it('should downgrade PRO user to FREE and send email', async () => {
      const user = {
        id: 'user-2',
        email: 'pro@test.com',
        name: 'Pro User',
        plan: Plan.PRO,
        stripeCustomerId: 'cus_456',
      };

      const proEvent = {
        ...mockDeletedEvent,
        data: {
          object: {
            ...mockDeletedEvent.data.object,
            customer: 'cus_456',
          },
        },
      };

      (mockStripeService.constructWebhookEvent as Mock).mockReturnValue(proEvent);
      mockPrisma.user.findFirst.mockResolvedValue(user);
      mockPrisma.subscription.delete.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({ ...user, plan: Plan.FREE });

      await useCase.execute('payload', 'signature');

      // Wait for non-blocking email
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockEmailQueueService.addJob).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'subscription-ended',
          to: 'pro@test.com',
        }),
      );
    });

    it('should not send email if user was already FREE', async () => {
      const user = {
        id: 'user-3',
        email: 'free@test.com',
        name: 'Free User',
        plan: Plan.FREE,
        stripeCustomerId: 'cus_789',
      };

      const freeEvent = {
        ...mockDeletedEvent,
        data: {
          object: {
            ...mockDeletedEvent.data.object,
            customer: 'cus_789',
          },
        },
      };

      (mockStripeService.constructWebhookEvent as Mock).mockReturnValue(freeEvent);
      mockPrisma.user.findFirst.mockResolvedValue(user);
      mockPrisma.subscription.delete.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue(user);

      await useCase.execute('payload', 'signature');

      // Wait to ensure email is not sent
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockEmailQueueService.addJob).not.toHaveBeenCalled();
    });

    it('should succeed even if email fails', async () => {
      const user = {
        id: 'user-4',
        email: 'fail@test.com',
        name: 'Fail User',
        plan: Plan.SOLO,
        stripeCustomerId: 'cus_fail',
      };

      const failEvent = {
        ...mockDeletedEvent,
        data: {
          object: {
            ...mockDeletedEvent.data.object,
            customer: 'cus_fail',
          },
        },
      };

      (mockStripeService.constructWebhookEvent as Mock).mockReturnValue(failEvent);
      mockPrisma.user.findFirst.mockResolvedValue(user);
      mockPrisma.subscription.delete.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({ ...user, plan: Plan.FREE });
      (mockEmailQueueService.addJob as Mock).mockRejectedValue(new Error('Email service down'));

      // Should not throw
      await expect(useCase.execute('payload', 'signature')).resolves.not.toThrow();

      // Wait for non-blocking email attempt
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockEmailQueueService.addJob).toHaveBeenCalled();
    });

    it('should handle invalid webhook event', async () => {
      (mockStripeService.constructWebhookEvent as Mock).mockReturnValue(null);

      await useCase.execute('invalid', 'signature');

      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('unhandled events', () => {
    it('should log unhandled event types', async () => {
      const unknownEvent = {
        type: 'unknown.event',
        data: { object: {} },
      };

      (mockStripeService.constructWebhookEvent as Mock).mockReturnValue(unknownEvent);

      await useCase.execute('payload', 'signature');

      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });
  });
});
