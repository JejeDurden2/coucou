import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan, SubscriptionStatus, type User } from '@prisma/client';

import { LoggerService } from '../../../../common/logger';
import { PrismaService } from '../../../../prisma';
import { EmailQueueService } from '../../../../infrastructure/queue';
import { UnsubscribeTokenService } from '../../../email';
import { StripeService } from '../../infrastructure/stripe.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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

interface WebhookInvoice {
  id: string;
  customer: string;
  subscription: string;
  status: string;
}

@Injectable()
export class HandleWebhookUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(HandleWebhookUseCase.name);
  }

  async execute(payload: string, signature: string): Promise<void> {
    const event = this.stripeService.constructWebhookEvent(payload, signature);
    if (!event) {
      this.logger.error('Invalid webhook event');
      return;
    }

    this.logger.info('Processing webhook event', { type: event.type });

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
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as unknown as WebhookInvoice);
        break;
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as unknown as WebhookInvoice);
        break;
      default:
        this.logger.info('Unhandled event type', { type: event.type });
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

    this.logger.info('Subscription created', { userId: user.id, plan });

    if (plan !== Plan.FREE) {
      this.queueEmailSafe(
        () => this.queuePostUpgradeEmails(user, plan),
        'post-upgrade email sequence',
        user.id,
      );
    }
  }

  private async queuePostUpgradeEmails(user: User, plan: Plan): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://coucou-ia.com';
    const apiUrl = this.configService.get<string>('API_URL') ?? 'https://api.coucou-ia.com';
    const userName = user.name ?? user.email.split('@')[0];
    const firstName = userName.split(' ')[0];
    const dashboardUrl = `${frontendUrl}/projects`;
    const unsubscribeToken = this.unsubscribeTokenService.generateToken(user.id);
    const unsubscribeUrl = `${apiUrl}/email/unsubscribe?token=${unsubscribeToken}`;

    // Immediate: plan upgrade confirmation
    await this.emailQueueService.addJob({
      type: 'plan-upgrade',
      to: user.email,
      data: { userName, planName: plan as 'SOLO' | 'PRO', dashboardUrl },
    });

    // Immediate: post-upgrade welcome with feature guidance
    await this.emailQueueService.addJob({
      type: 'post-upgrade-welcome',
      to: user.email,
      data: { userName, planName: plan as 'SOLO' | 'PRO', dashboardUrl },
    });

    // Delayed emails use deterministic jobIds to prevent duplicates on webhook retry
    await this.emailQueueService.addJob(
      {
        type: 'post-upgrade-tips',
        to: user.email,
        data: { firstName, planName: plan as 'SOLO' | 'PRO', dashboardUrl, unsubscribeUrl },
      },
      { delay: 3 * ONE_DAY_MS, jobId: `post-upgrade-tips-${user.id}` },
    );

    await this.emailQueueService.addJob(
      {
        type: 'founder-outreach',
        to: user.email,
        data: { firstName, dashboardUrl },
      },
      { delay: 7 * ONE_DAY_MS, jobId: `founder-outreach-${user.id}` },
    );

    await this.emailQueueService.addJob(
      {
        type: 'nps-survey',
        to: user.email,
        data: { firstName, surveyUrl: `${frontendUrl}/nps`, unsubscribeUrl },
      },
      { delay: 30 * ONE_DAY_MS, jobId: `nps-survey-${user.id}` },
    );
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

    this.logger.info('Subscription updated', { userId: user.id, plan });
  }

  private async handleSubscriptionDeleted(subscription: WebhookSubscription): Promise<void> {
    const user = await this.findUserByStripeCustomerId(subscription.customer);
    if (!user) return;

    const previousPlan = user.plan;
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.subscription.delete({
        where: { userId: user.id },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          plan: Plan.FREE,
          previousPlan,
          subscriptionEndedAt: now,
        },
      }),
    ]);

    this.logger.info('Subscription deleted', { userId: user.id, previousPlan });

    if (previousPlan === Plan.SOLO || previousPlan === Plan.PRO) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://coucou-ia.com';
      const userName = user.name ?? user.email.split('@')[0];

      this.queueEmailSafe(
        () =>
          this.emailQueueService.addJob({
            type: 'subscription-ended',
            to: user.email,
            data: { userName, previousPlan, billingUrl: `${frontendUrl}/billing` },
          }),
        'subscription ended email',
        user.id,
      );

      this.queueEmailSafe(
        () =>
          this.emailQueueService.addJob({
            type: 'cancellation-survey',
            to: user.email,
            data: { userName, surveyUrl: `${frontendUrl}/billing?feedback=true` },
          }),
        'cancellation survey',
        user.id,
      );
    }
  }

  private async handleInvoicePaymentFailed(invoice: WebhookInvoice): Promise<void> {
    const user = await this.findUserByStripeCustomerId(invoice.customer);
    if (!user) return;

    // Skip if we already processed a payment failure within the last 24h (idempotency)
    if (user.lastPaymentFailedAt) {
      const elapsed = Date.now() - new Date(user.lastPaymentFailedAt).getTime();
      if (elapsed < ONE_DAY_MS) {
        this.logger.info('Dunning already active, skipping', { userId: user.id });
        return;
      }
    }

    this.logger.info('Invoice payment failed', { userId: user.id });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastPaymentFailedAt: new Date() },
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'https://coucou-ia.com';
    const userName = user.name ?? user.email.split('@')[0];
    const billingUrl = `${frontendUrl}/billing`;
    const planName = user.plan as 'SOLO' | 'PRO';

    // Deterministic jobIds prevent duplicate emails on webhook retry
    this.queueEmailSafe(
      () =>
        this.emailQueueService.addJob(
          { type: 'dunning-first', to: user.email, data: { userName, planName, billingUrl } },
          { jobId: `dunning-first-${user.id}` },
        ),
      'dunning-first',
      user.id,
    );

    this.queueEmailSafe(
      () =>
        this.emailQueueService.addJob(
          { type: 'dunning-urgent', to: user.email, data: { userName, planName, billingUrl } },
          { delay: 3 * ONE_DAY_MS, jobId: `dunning-urgent-${user.id}` },
        ),
      'dunning-urgent',
      user.id,
    );

    this.queueEmailSafe(
      () =>
        this.emailQueueService.addJob(
          { type: 'dunning-final', to: user.email, data: { userName, planName, billingUrl } },
          { delay: 7 * ONE_DAY_MS, jobId: `dunning-final-${user.id}` },
        ),
      'dunning-final',
      user.id,
    );
  }

  private async handleInvoicePaid(invoice: WebhookInvoice): Promise<void> {
    const user = await this.findUserByStripeCustomerId(invoice.customer);
    if (!user) return;

    if (user.lastPaymentFailedAt) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastPaymentFailedAt: null },
      });
      this.logger.info('Payment recovered', { userId: user.id });
    }
  }

  private queueEmailSafe(fn: () => Promise<unknown>, label: string, userId: string): void {
    fn().catch((error) => {
      this.logger.error(`Failed to queue ${label}`, error instanceof Error ? error : undefined, {
        userId,
      });
    });
  }

  private async findUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId },
    });

    if (!user) {
      this.logger.error('User not found for Stripe customer', { stripeCustomerId });
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
      case 'trialing':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  private toSafeDate(unixTimestamp: number | undefined | null): Date {
    if (!unixTimestamp || unixTimestamp <= 0) {
      this.logger.warn('Invalid timestamp received, using current date', {
        timestamp: unixTimestamp,
      });
      return new Date();
    }
    return new Date(unixTimestamp * 1000);
  }
}
