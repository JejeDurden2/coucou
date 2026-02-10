import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Result, UnauthorizedError } from '../../../../common';
import { PrismaService } from '../../../../prisma';
import { USER_REPOSITORY, type UserRepository } from '../../domain';
import type { AuthResponseDto, JwtPayload } from '../dto/auth.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(refreshToken: string): Promise<Result<AuthResponseDto, UnauthorizedError>> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(refreshToken);
      const user = await this.userRepository.findById(decoded.sub);

      if (!user) {
        return Result.err(new UnauthorizedError('Invalid refresh token'));
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        plan: user.plan,
      };

      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      });

      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      });

      const projectCount = await this.prisma.project.count({ where: { userId: user.id } });

      return Result.ok({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
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
    } catch {
      return Result.err(new UnauthorizedError('Invalid refresh token'));
    }
  }
}
