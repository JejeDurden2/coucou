import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { ConflictError, Result } from '../../../../common';
import { EMAIL_PORT, type EmailPort, generateWelcomeEmail } from '../../../email';
import type { User } from '../../domain';
import { USER_REPOSITORY, type UserRepository } from '../../domain';
import type { RegisterDto } from '../dto/auth.dto';

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(EMAIL_PORT)
    private readonly emailService: EmailPort,
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

    // Send welcome email (non-blocking)
    this.sendWelcomeEmail(user).catch((error) => {
      this.logger.error(`Failed to send welcome email to ${user.email}`, error);
    });

    return Result.ok(user);
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const { html, text } = generateWelcomeEmail({
      userName: user.name ?? user.email.split('@')[0],
      loginUrl: `${frontendUrl}/login`,
    });

    await this.emailService.send({
      to: user.email,
      subject: 'Bienvenue sur Coucou IA - Votre visibilite IA commence ici',
      html,
      text,
    });
  }
}
