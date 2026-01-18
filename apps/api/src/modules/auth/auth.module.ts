import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { USER_REPOSITORY } from './domain';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { CookieService } from './infrastructure/services/cookie.service';
import {
  DeleteAccountUseCase,
  ExportDataUseCase,
  GetMeUseCase,
  GoogleAuthUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
  UpdateProfileUseCase,
} from './application/use-cases';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { GoogleAuthGuard } from './presentation/guards/google-auth.guard';
import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { GoogleStrategy } from './presentation/strategies/google.strategy';

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
    GoogleAuthUseCase,
    // Strategies & Guards
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    GoogleAuthGuard,
    // Infrastructure services
    CookieService,
    // Repository binding
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY, JwtAuthGuard, JwtStrategy, CookieService],
})
export class AuthModule {}
