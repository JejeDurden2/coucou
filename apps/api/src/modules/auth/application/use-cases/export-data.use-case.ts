import { Inject, Injectable } from '@nestjs/common';

import { Result } from '../../../../common/utils/result';
import { DomainError } from '../../../../common/errors/domain-error';
import { PrismaService } from '../../../../prisma';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../domain/repositories/user.repository';

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor() {
    super('User not found');
  }
}

export interface ExportedData {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
    createdAt: string;
  };
  projects: Array<{
    id: string;
    name: string;
    brandName: string;
    brandVariants: string[];
    domain: string | null;
    createdAt: string;
    prompts: Array<{
      id: string;
      content: string;
      category: string | null;
      isActive: boolean;
      createdAt: string;
      scans: Array<{
        id: string;
        executedAt: string;
        results: unknown;
      }>;
    }>;
  }>;
  subscription: {
    plan: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  } | null;
}

@Injectable()
export class ExportDataUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(userId: string): Promise<Result<ExportedData, UserNotFoundError>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return Result.err(new UserNotFoundError());
    }

    // Fetch all user data with relations
    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            prompts: {
              include: {
                scans: {
                  orderBy: { executedAt: 'desc' },
                  take: 100, // Limit scans per prompt
                },
              },
            },
          },
        },
        subscription: true,
      },
    });

    if (!userData) {
      return Result.err(new UserNotFoundError());
    }

    const exportedData: ExportedData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        plan: userData.plan,
        createdAt: userData.createdAt.toISOString(),
      },
      projects: userData.projects.map((project) => ({
        id: project.id,
        name: project.name,
        brandName: project.brandName,
        brandVariants: project.brandVariants,
        domain: project.domain,
        createdAt: project.createdAt.toISOString(),
        prompts: project.prompts.map((prompt) => ({
          id: prompt.id,
          content: prompt.content,
          category: prompt.category,
          isActive: prompt.isActive,
          createdAt: prompt.createdAt.toISOString(),
          scans: prompt.scans.map((scan) => ({
            id: scan.id,
            executedAt: scan.executedAt.toISOString(),
            results: scan.results,
          })),
        })),
      })),
      subscription: userData.subscription
        ? {
            plan: userData.subscription.plan,
            status: userData.subscription.status,
            currentPeriodStart: userData.subscription.currentPeriodStart.toISOString(),
            currentPeriodEnd: userData.subscription.currentPeriodEnd.toISOString(),
          }
        : null,
    };

    return Result.ok(exportedData);
  }
}
