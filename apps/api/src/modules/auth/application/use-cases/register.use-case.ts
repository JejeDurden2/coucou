import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { ConflictError, Result } from '../../../../common';
import { EmailQueueService } from '../../../../infrastructure/queue';
import type { User } from '../../domain';
import { USER_REPOSITORY, type UserRepository } from '../../domain';
import type { RegisterDto } from '../dto/auth.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
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
