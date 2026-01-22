import { Injectable } from '@nestjs/common';
import type { Subscription } from '@prisma/client';
import { SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../../../../prisma';
import type {
  SubscriptionRepository,
  SubscriptionUpdateData,
} from '../../domain/repositories/subscription.repository';

@Injectable()
export class SubscriptionRepositoryAdapter implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where: { id } });
  }

  findByUserId(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  findActiveByUserId(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
  }

  update(id: string, data: SubscriptionUpdateData): Promise<Subscription> {
    return this.prisma.subscription.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscription.delete({ where: { id } });
  }
}
