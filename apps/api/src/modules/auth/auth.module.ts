import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { BillingModule } from '../billing/billing.module';
import { EmailModule } from '../email/email.module';
import { USER_REPOSITORY, PASSWORD_RESET_REPOSITORY, CONSENT_REPOSITORY } from './domain';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { PrismaPasswordResetRepository } from './infrastructure/persistence/prisma-password-reset.repository';
import { PrismaConsentRepository } from './infrastructure/persistence/prisma-consent.repository';
import { CookieService } from './infrastructure/services/cookie.service';
import {
  DeleteAccountUseCase,
  ExportDataUseCase,
  ForgotPasswordUseCase,
  GetMeUseCase,
  GoogleAuthUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
  ResetPasswordUseCase,
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
    forwardRef(() => BillingModule),
    EmailModule,
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
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    // Strategies & Guards
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    GoogleAuthGuard,
    // Infrastructure services
    CookieService,
    // Repository bindings
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_RESET_REPOSITORY,
      useClass: PrismaPasswordResetRepository,
    },
    {
      provide: CONSENT_REPOSITORY,
      useClass: PrismaConsentRepository,
    },
  ],
  exports: [USER_REPOSITORY, JwtAuthGuard, JwtStrategy, CookieService],
})
export class AuthModule {}
