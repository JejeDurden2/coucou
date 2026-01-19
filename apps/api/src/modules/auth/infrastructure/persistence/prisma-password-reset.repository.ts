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

  async consumeToken(token: string): Promise<PasswordResetToken | null> {
    // Use a transaction with optimistic locking to prevent TOCTOU race condition
    return this.prisma.$transaction(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken) {
        return null;
      }

      // Check if already used or expired
      if (resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
        return null;
      }

      // Atomically mark as used only if still unused (optimistic lock)
      const updated = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null, // Only update if still unused
        },
        data: { usedAt: new Date() },
      });

      // If no rows updated, another request already consumed the token
      if (updated.count === 0) {
        return null;
      }

      return resetToken;
    });
  }
}
