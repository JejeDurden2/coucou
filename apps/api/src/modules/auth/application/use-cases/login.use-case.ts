import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { Result, UnauthorizedError } from '../../../../common';
import { USER_REPOSITORY, type UserRepository } from '../../domain';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from '../../../project/domain/repositories/project.repository';
import type { AuthResponseDto, JwtPayload, LoginDto } from '../dto/auth.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<Result<AuthResponseDto, UnauthorizedError>> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      return Result.err(new UnauthorizedError('Invalid credentials'));
    }

    // User registered via OAuth (no password)
    if (!user.password) {
      return Result.err(new UnauthorizedError('Invalid credentials'));
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      return Result.err(new UnauthorizedError('Invalid credentials'));
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      plan: user.plan,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const projectCount = await this.projectRepository.countByUserId(user.id);

    return Result.ok({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        projectCount,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
        createdAt: user.createdAt,
        isOAuthUser: !!user.googleId,
      },
    });
  }
}
