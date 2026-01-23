import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '@coucou-ia/shared';

import { ConflictError, Result } from '../../../../common';
import { EmailQueueService } from '../../../../infrastructure/queue';
import type { User } from '../../domain';
import {
  USER_REPOSITORY,
  CONSENT_REPOSITORY,
  type UserRepository,
  type ConsentRepository,
} from '../../domain';
import type { RegisterDto } from '../dto/auth.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(CONSENT_REPOSITORY)
    private readonly consentRepository: ConsentRepository,
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RegisterDto): Promise<Result<User, ConflictError>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      return Result.err(new ConflictError('User', 'email', dto.email));
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });

    // Log consent for RGPD compliance
    await Promise.all([
      this.consentRepository.logConsent({
        userId: user.id,
        type: 'TERMS_OF_SERVICE',
        action: 'ACCEPTED',
        version: CURRENT_TERMS_VERSION,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      }),
      this.consentRepository.logConsent({
        userId: user.id,
        type: 'PRIVACY_POLICY',
        action: 'ACCEPTED',
        version: CURRENT_PRIVACY_VERSION,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      }),
    ]);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const userName = user.name ?? user.email.split('@')[0];

    // Send welcome email via queue
    await this.emailQueueService.addJob({
      type: 'welcome',
      to: user.email,
      data: {
        userName,
        loginUrl: `${frontendUrl}/login`,
      },
    });

    // Send admin notification via queue
    await this.emailQueueService.addJob({
      type: 'new-user-notification',
      to: 'jerome@coucou-ia.com',
      data: {
        userName,
        userEmail: user.email,
        authMethod: 'email' as const,
        createdAt: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
      },
    });

    return Result.ok(user);
  }
}
