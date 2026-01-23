import { Injectable } from '@nestjs/common';
import type {
  ConsentType as PrismaConsentType,
  ConsentAction as PrismaConsentAction,
} from '@prisma/client';

import { PrismaService } from '../../../../prisma';
import type {
  ConsentRepository,
  ConsentLog,
  LogConsentData,
} from '../../domain/repositories/consent.repository';

@Injectable()
export class PrismaConsentRepository implements ConsentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async logConsent(data: LogConsentData): Promise<ConsentLog> {
    const consent = await this.prisma.consentLog.create({
      data: {
        userId: data.userId,
        type: data.type as PrismaConsentType,
        action: data.action as PrismaConsentAction,
        version: data.version,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    return {
      id: consent.id,
      userId: consent.userId,
      type: consent.type,
      action: consent.action,
      version: consent.version,
      ipAddress: consent.ipAddress,
      userAgent: consent.userAgent,
      createdAt: consent.createdAt,
    };
  }

  async hasAcceptedCurrentTerms(userId: string, version: string): Promise<boolean> {
    const consent = await this.prisma.consentLog.findFirst({
      where: {
        userId,
        type: 'TERMS_OF_SERVICE',
        action: 'ACCEPTED',
        version,
      },
      orderBy: { createdAt: 'desc' },
    });

    return consent !== null;
  }

  async getConsentHistory(userId: string): Promise<ConsentLog[]> {
    const consents = await this.prisma.consentLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return consents.map((consent) => ({
      id: consent.id,
      userId: consent.userId,
      type: consent.type,
      action: consent.action,
      version: consent.version,
      ipAddress: consent.ipAddress,
      userAgent: consent.userAgent,
      createdAt: consent.createdAt,
    }));
  }
}
