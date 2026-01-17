import { Injectable } from '@nestjs/common';
import type { Plan } from '@prisma/client';

import { PrismaService } from '../../../../prisma';
import { User } from '../../domain/entities/user.entity';
import type {
  CreateUserData,
  UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? User.fromPersistence(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? User.fromPersistence(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
      },
    });
    return User.fromPersistence(user);
  }

  async updatePlan(
    userId: string,
    plan: string,
    stripeCustomerId?: string,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan as Plan,
        ...(stripeCustomerId && { stripeCustomerId }),
      },
    });
    return User.fromPersistence(user);
  }
}
