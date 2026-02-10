import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { unwrapOrThrow } from '../../../../common';
import type { AuthenticatedUser } from '../../application/dto/auth.dto';
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
} from '../../application/use-cases';
import { CookieService, REFRESH_TOKEN_COOKIE } from '../../infrastructure/services/cookie.service';
import type { GoogleProfile } from '../strategies/google.strategy';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  DeleteAccountRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
  UpdateProfileRequestDto,
} from '../dto/auth-request.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly allowedRedirectHosts: Set<string>;

  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly exportDataUseCase: ExportDataUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly googleAuthUseCase: GoogleAuthUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly configService: ConfigService,
    private readonly cookieService: CookieService,
  ) {
    // Build allowlist of valid redirect hosts from FRONTEND_URL
    this.allowedRedirectHosts = new Set(
      configService
        .get<string>('FRONTEND_URL', 'http://localhost:3000')
        .split(',')
        .map((url) => {
          try {
            return new URL(url.trim()).host;
          } catch {
            return null;
          }
        })
        .filter((host): host is string => host !== null),
    );
  }

  private isValidRedirectUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return this.allowedRedirectHosts.has(parsed.host);
    } catch {
      return false;
    }
  }

  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  async register(
    @Body() dto: RegisterRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    unwrapOrThrow(
      await this.registerUseCase.execute({
        email: dto.email,
        name: dto.name,
        password: dto.password,
        ipAddress: req.ip ?? req.headers['x-forwarded-for']?.toString(),
        userAgent: req.headers['user-agent'],
      }),
    );

    // Auto-login after registration
    const { user, accessToken, refreshToken } = unwrapOrThrow(
      await this.loginUseCase.execute({ email: dto.email, password: dto.password }),
    );

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);

    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  async login(@Body() dto: LoginRequestDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken } = unwrapOrThrow(
      await this.loginUseCase.execute(dto),
    );

    this.cookieService.setAuthCookies(res, accessToken, refreshToken);

    return { user };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    await this.forgotPasswordUseCase.execute(dto.email);
    // Always return success to prevent email enumeration
    return {
      message: 'Si un compte existe avec cet email, vous recevrez un lien de reinitialisation.',
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async resetPassword(@Body() dto: ResetPasswordRequestDto) {
    unwrapOrThrow(await this.resetPasswordUseCase.execute(dto.token, dto.password));
    return { message: 'Votre mot de passe a ete reinitialise avec succes.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return unwrapOrThrow(await this.getMeUseCase.execute(user.id));
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileRequestDto,
  ) {
    return unwrapOrThrow(await this.updateProfileUseCase.execute(user.id, dto)).toJSON();
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (!refreshToken) {
      throw new HttpException(
        { code: 'UNAUTHORIZED', message: 'Refresh token not found' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    if (!result.ok) {
      this.cookieService.clearAuthCookies(res);
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    const { user, accessToken, refreshToken: newRefreshToken } = result.value;
    this.cookieService.setAuthCookies(res, accessToken, newRefreshToken);

    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    this.cookieService.clearAuthCookies(res);
  }

  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  async exportData(@CurrentUser() user: AuthenticatedUser) {
    return unwrapOrThrow(await this.exportDataUseCase.execute(user.id));
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DeleteAccountRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const value = unwrapOrThrow(
      await this.deleteAccountUseCase.execute({ userId: user.id, confirmation: dto.confirmation }),
    );

    this.cookieService.clearAuthCookies(res);

    return value;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const profile = req.user as GoogleProfile;
    const { accessToken, refreshToken } = await this.googleAuthUseCase.execute(profile);

    // Set HttpOnly cookies
    this.cookieService.setAuthCookies(res, accessToken, refreshToken);

    // Validate redirect URL to prevent open redirect attacks
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const redirectUrl = `${frontendUrl}/auth/callback`;

    if (!this.isValidRedirectUrl(redirectUrl)) {
      throw new HttpException('Invalid redirect URL', HttpStatus.BAD_REQUEST);
    }

    res.redirect(redirectUrl);
  }
}
