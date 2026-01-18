import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { USER_REPOSITORY } from './domain';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import {
  DeleteAccountUseCase,
  ExportDataUseCase,
  GetMeUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
  UpdateProfileUseCase,
} from './application/use-cases';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { JwtStrategy } from './presentation/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use cases
    RegisterUseCase,
    LoginUseCase,
    GetMeUseCase,
    RefreshTokenUseCase,
    DeleteAccountUseCase,
    ExportDataUseCase,
    UpdateProfileUseCase,
    // Strategies & Guards
    JwtStrategy,
    JwtAuthGuard,
    // Repository binding
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
