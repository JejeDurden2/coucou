import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan, SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../../../../prisma';
import { EmailQueueService } from '../../../../infrastructure/queue';
import { StripeService } from '../../infrastructure/stripe.service';

interface WebhookCheckoutSession {
  id: string;
  customer: string;
  subscription: string;
}

interface WebhookSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
}

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async execute(payload: string, signature: string): Promise<void> {
    const event = this.stripeService.constructWebhookEvent(payload, signature);
    if (!event) {
      this.logger.error('Invalid webhook event');
      return;
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as unknown as WebhookCheckoutSession);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as unknown as WebhookSubscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as unknown as WebhookSubscription);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: WebhookCheckoutSession): Promise<void> {
    const user = await this.findUserByStripeCustomerId(session.customer);
    if (!user) return;

    const subscription = await this.stripeService.getSubscription(session.subscription);
    const plan = this.getPlanFromSubscription(subscription);

    const currentPeriodStart = this.toSafeDate(subscription.current_period_start);
    const currentPeriodEnd = this.toSafeDate(subscription.current_period_end);

    await this.prisma.$transaction([
      this.prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeSubscriptionId: session.subscription,
          status: this.mapStatus(subscription.status),
          plan,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
        },
        update: {
          stripeSubscriptionId: session.subscription,
          status: this.mapStatus(subscription.status),
          plan,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { plan },
      }),
    ]);

    this.logger.log(`Subscription created for user: ${user.id}, plan: ${plan}`);

    // Send plan upgrade email via queue (non-blocking)
    if (plan !== Plan.FREE) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://coucou-ia.com';
      this.emailQueueService
        .addJob({
          type: 'plan-upgrade',
          to: user.email,
          data: {
            userName: user.name ?? user.email.split('@')[0],
            planName: plan as 'SOLO' | 'PRO',
            dashboardUrl: `${frontendUrl}/projects`,
          },
        })
        .catch((error) => {
          this.logger.error(`Failed to queue plan upgrade email for ${user.email}`, error);
        });
    }
  }

  private async handleSubscriptionUpdated(subscription: WebhookSubscription): Promise<void> {
    const user = await this.findUserByStripeCustomerId(subscription.customer);
    if (!user) return;

    const plan = this.getPlanFromSubscription(subscription);
    const currentPeriodStart = this.toSafeDate(subscription.current_period_start);
    const currentPeriodEnd = this.toSafeDate(subscription.current_period_end);

    await this.prisma.$transaction([
      this.prisma.subscription.update({
        where: { userId: user.id },
        data: {
          status: this.mapStatus(subscription.status),
          plan,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { plan },
      }),
    ]);

    this.logger.log(`Subscription updated for user: ${user.id}, plan: ${plan}`);
  }

  private async handleSubscriptionDeleted(subscription: WebhookSubscription): Promise<void> {
    const user = await this.findUserByStripeCustomerId(subscription.customer);
    if (!user) return;

    const previousPlan = user.plan;

    await this.prisma.$transaction([
      this.prisma.subscription.delete({
        where: { userId: user.id },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { plan: Plan.FREE },
      }),
    ]);

    this.logger.log(`Subscription deleted for user: ${user.id}, previousPlan: ${previousPlan}`);

    // Send subscription ended email via queue (non-blocking)
    if (previousPlan === Plan.SOLO || previousPlan === Plan.PRO) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://coucou-ia.com';
      this.emailQueueService
        .addJob({
          type: 'subscription-ended',
          to: user.email,
          data: {
            userName: user.name ?? user.email.split('@')[0],
            previousPlan,
            billingUrl: `${frontendUrl}/billing`,
          },
        })
        .catch((error) => {
          this.logger.error(`Failed to queue subscription ended email for ${user.email}`, error);
        });
    }
  }

  private async findUserByStripeCustomerId(stripeCustomerId: string) {
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId },
    });

    if (!user) {
      this.logger.error(`User not found for customer: ${stripeCustomerId}`);
    }

    return user;
  }

  private getPlanFromSubscription(subscription: Pick<WebhookSubscription, 'items'>): Plan {
    const priceId = subscription.items.data[0]?.price?.id;
    return priceId ? this.stripeService.getPlanFromPriceId(priceId) : Plan.FREE;
  }

  private mapStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
      case 'trialing': // No trial period - treat as active
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  /**
   * Convert Unix timestamp (seconds) to Date, with fallback to now if invalid
   */
  private toSafeDate(unixTimestamp: number | undefined | null): Date {
    if (!unixTimestamp || unixTimestamp <= 0) {
      this.logger.warn(`Invalid timestamp received: ${unixTimestamp}, using current date`);
      return new Date();
    }
    return new Date(unixTimestamp * 1000);
  }
}
