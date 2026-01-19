import { Injectable, Logger } from '@nestjs/common';
import { Plan, SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../../../../prisma';
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
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: session.customer },
    });

    if (!user) {
      this.logger.error(`User not found for customer: ${session.customer}`);
      return;
    }

    const subscription = await this.stripeService.getSubscription(session.subscription);
    const priceId = subscription.items.data[0]?.price?.id;
    const plan = priceId ? this.stripeService.getPlanFromPriceId(priceId) : Plan.FREE;

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
  }

  private async handleSubscriptionUpdated(subscription: WebhookSubscription): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer },
    });

    if (!user) {
      this.logger.error(`User not found for customer: ${subscription.customer}`);
      return;
    }

    const priceId = subscription.items.data[0]?.price?.id;
    const plan = priceId ? this.stripeService.getPlanFromPriceId(priceId) : Plan.FREE;

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
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer },
    });

    if (!user) {
      this.logger.error(`User not found for customer: ${subscription.customer}`);
      return;
    }

    await this.prisma.$transaction([
      this.prisma.subscription.delete({
        where: { userId: user.id },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { plan: Plan.FREE },
      }),
    ]);

    this.logger.log(`Subscription deleted for user: ${user.id}`);
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
