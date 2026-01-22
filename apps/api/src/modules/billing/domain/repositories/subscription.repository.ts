import type { Subscription, SubscriptionStatus } from '@prisma/client';

export interface SubscriptionUpdateData {
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

export interface SubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUserId(userId: string): Promise<Subscription | null>;
  findActiveByUserId(userId: string): Promise<Subscription | null>;
  update(id: string, data: SubscriptionUpdateData): Promise<Subscription>;
  delete(id: string): Promise<void>;
}

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');
