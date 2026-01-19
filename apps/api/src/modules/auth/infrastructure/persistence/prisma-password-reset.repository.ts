import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma';
import type {
  PasswordResetRepository,
  PasswordResetToken,
} from '../../domain/repositories/password-reset.repository';

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    return this.prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { token },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteExpiredTokens(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
      },
    });
  }
}
