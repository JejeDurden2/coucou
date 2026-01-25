import { Injectable } from '@nestjs/common';
import type { Plan } from '@prisma/client';

import { PrismaService } from '../../../../prisma';
import { User } from '../../domain/entities/user.entity';
import type {
  CreateUserData,
  CreateOAuthUserData,
  UserRepository,
  UserEmailPrefs,
} from '../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    if (!id) {
      return null;
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? User.fromPersistence(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? User.fromPersistence(user) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { googleId } });
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

  async createFromOAuth(data: CreateOAuthUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
      },
    });
    return User.fromPersistence(user);
  }

  async linkGoogleAccount(userId: string, googleId: string, avatarUrl?: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        googleId,
        ...(avatarUrl && { avatarUrl }),
      },
    });
    return User.fromPersistence(user);
  }

  async updatePlan(userId: string, plan: string, stripeCustomerId?: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan as Plan,
        ...(stripeCustomerId && { stripeCustomerId }),
      },
    });
    return User.fromPersistence(user);
  }

  async updateName(userId: string, name: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    return User.fromPersistence(user);
  }

  async updateEmail(userId: string, email: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { email },
    });
    return User.fromPersistence(user);
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return User.fromPersistence(user);
  }

  async updateLastScanAt(userId: string, date: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastScanAt: date },
    });
  }

  async findByIdWithEmailPrefs(userId: string): Promise<UserEmailPrefs | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        emailNotificationsEnabled: true,
        lastPostScanEmailAt: true,
      },
    });
    return user;
  }

  async updateLastPostScanEmailAt(userId: string, date: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastPostScanEmailAt: date },
    });
  }

  async updateEmailNotificationsEnabled(userId: string, enabled: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailNotificationsEnabled: enabled },
    });
  }

  async delete(userId: string): Promise<void> {
    // Delete in order: scans -> prompts -> projects -> subscriptions -> user
    await this.prisma.$transaction(async (tx) => {
      // Get all projects for the user
      const projects = await tx.project.findMany({
        where: { userId },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);

      // Get all prompts for these projects
      const prompts = await tx.prompt.findMany({
        where: { projectId: { in: projectIds } },
        select: { id: true },
      });
      const promptIds = prompts.map((p) => p.id);

      // Delete scans
      await tx.scan.deleteMany({ where: { promptId: { in: promptIds } } });

      // Delete prompts
      await tx.prompt.deleteMany({ where: { projectId: { in: projectIds } } });

      // Delete projects
      await tx.project.deleteMany({ where: { userId } });

      // Delete subscription
      await tx.subscription.deleteMany({ where: { userId } });

      // Delete user
      await tx.user.delete({ where: { id: userId } });
    });
  }

  async anonymize(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Get all projects for the user
      const projects = await tx.project.findMany({
        where: { userId },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);

      // Get all prompts for these projects
      const prompts = await tx.prompt.findMany({
        where: { projectId: { in: projectIds } },
        select: { id: true },
      });
      const promptIds = prompts.map((p) => p.id);

      // Delete scans
      await tx.scan.deleteMany({ where: { promptId: { in: promptIds } } });

      // Delete prompts
      await tx.prompt.deleteMany({ where: { projectId: { in: projectIds } } });

      // Delete projects
      await tx.project.deleteMany({ where: { userId } });

      // Delete subscription
      await tx.subscription.deleteMany({ where: { userId } });

      // Delete password reset tokens
      await tx.passwordResetToken.deleteMany({ where: { userId } });

      // Anonymize user data (soft delete)
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@anonymized.local`,
          name: 'Utilisateur supprimé',
          password: null,
          googleId: null,
          avatarUrl: null,
          stripeCustomerId: null,
          plan: 'FREE',
          deletedAt: new Date(),
        },
      });
    });
  }
}
