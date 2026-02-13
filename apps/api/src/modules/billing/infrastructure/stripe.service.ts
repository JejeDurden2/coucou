import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan } from '@prisma/client';
import Stripe from 'stripe';

import { ConfigurationError, ExternalServiceError } from '../../../common';
import { LoggerService } from '../../../common/logger';

interface StripeCheckoutSession {
  id: string;
  url: string | null;
}

interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
}

interface AuditCheckoutParams {
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
}

interface StripePortalSession {
  url: string;
}

interface StripeSubscription {
  id: string;
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

interface StripeCustomer {
  id: string;
}

interface StripeWebhookEvent {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly priceIds: Record<Exclude<Plan, 'FREE'>, string>;
  private readonly baseUrl = 'https://api.stripe.com/v1';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeService.name);
    this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') ?? '';
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    this.priceIds = {
      [Plan.SOLO]: this.configService.get<string>('STRIPE_PRICE_SOLO') ?? '',
      [Plan.PRO]: this.configService.get<string>('STRIPE_PRICE_PRO') ?? '',
    };
    this.stripe = new Stripe(this.secretKey);
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Log status code only, not response body (may contain sensitive data)
      this.logger.error('Stripe API error', { status: response.status });
      throw new ExternalServiceError('Stripe', 'Payment service unavailable');
    }

    return response.json() as Promise<T>;
  }

  private toFormData(obj: Record<string, string | number | boolean>): string {
    return Object.entries(obj)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
  }

  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await this.fetch<StripeCustomer>('/customers', {
      method: 'POST',
      body: this.toFormData({ email, name }),
    });
    return customer.id;
  }

  async customerExists(customerId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });
      if (!response.ok) {
        return false;
      }
      const customer = (await response.json()) as { deleted?: boolean };
      return !customer.deleted;
    } catch {
      return false;
    }
  }

  async createCheckoutSession(
    customerId: string,
    plan: Exclude<Plan, 'FREE'>,
    successUrl: string,
    cancelUrl: string,
  ): Promise<StripeCheckoutSession> {
    const priceId = this.priceIds[plan];
    if (!priceId) {
      throw new ConfigurationError(`Missing Stripe price configuration for plan: ${plan}`);
    }

    return this.fetch<StripeCheckoutSession>('/checkout/sessions', {
      method: 'POST',
      body: this.toFormData({
        customer: customerId,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': 1,
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      }),
    });
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<StripePortalSession> {
    return this.fetch<StripePortalSession>('/billing_portal/sessions', {
      method: 'POST',
      body: this.toFormData({
        customer: customerId,
        return_url: returnUrl,
      }),
    });
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    return this.fetch<StripeSubscription>(`/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(
    subscriptionId: string,
    params: { cancel_at_period_end: boolean },
  ): Promise<StripeSubscription> {
    return this.fetch<StripeSubscription>(`/subscriptions/${subscriptionId}`, {
      method: 'POST',
      body: this.toFormData({
        cancel_at_period_end: params.cancel_at_period_end,
      }),
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    return this.fetch<StripeSubscription>(`/subscriptions/${subscriptionId}?prorate=true`, {
      method: 'DELETE',
    });
  }

  async getAuditPrice(): Promise<StripePrice> {
    const priceId = this.configService.get<string>('STRIPE_AUDIT_PRICE_ID') ?? '';
    if (!priceId) {
      throw new ConfigurationError('Missing STRIPE_AUDIT_PRICE_ID configuration');
    }
    return this.fetch<StripePrice>(`/prices/${priceId}`);
  }

  async createAuditCheckoutSession(params: AuditCheckoutParams): Promise<StripeCheckoutSession> {
    const priceId = this.configService.get<string>('STRIPE_AUDIT_PRICE_ID') ?? '';
    if (!priceId) {
      throw new ConfigurationError('Missing STRIPE_AUDIT_PRICE_ID configuration');
    }

    const formData: Record<string, string | number | boolean> = {
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': 1,
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      allow_promotion_codes: true,
    };

    for (const [key, value] of Object.entries(params.metadata)) {
      formData[`metadata[${key}]`] = value;
      formData[`payment_intent_data[metadata][${key}]`] = value;
    }

    return this.fetch<StripeCheckoutSession>('/checkout/sessions', {
      method: 'POST',
      body: this.toFormData(formData),
    });
  }

  getPlanFromPriceId(priceId: string): Plan {
    for (const [plan, id] of Object.entries(this.priceIds)) {
      if (id === priceId) {
        return plan as Plan;
      }
    }
    return Plan.FREE;
  }

  constructWebhookEvent(payload: string, signature: string): StripeWebhookEvent | null {
    if (!this.webhookSecret) {
      this.logger.error('Webhook secret not configured - rejecting webhook');
      return null;
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return {
        type: event.type,
        data: {
          object: event.data.object as unknown as Record<string, unknown>,
        },
      };
    } catch (error) {
      this.logger.error(
        'Webhook signature verification failed',
        error instanceof Error ? error : undefined,
      );
      return null;
    }
  }
}
