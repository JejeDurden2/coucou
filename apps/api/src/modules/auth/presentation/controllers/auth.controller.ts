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
  ) {}

  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  async register(@Body() dto: RegisterRequestDto, @Res({ passthrough: true }) res: Response) {
    const registerResult = await this.registerUseCase.execute(dto);

    if (!registerResult.ok) {
      throw new HttpException(registerResult.error.toJSON(), registerResult.error.statusCode);
    }

    // Auto-login after registration
    const loginResult = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });

    if (!loginResult.ok) {
      throw new HttpException(loginResult.error.toJSON(), loginResult.error.statusCode);
    }

    this.cookieService.setAuthCookies(
      res,
      loginResult.value.accessToken,
      loginResult.value.refreshToken,
    );

    return { user: loginResult.value.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  async login(@Body() dto: LoginRequestDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.loginUseCase.execute(dto);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    this.cookieService.setAuthCookies(res, result.value.accessToken, result.value.refreshToken);

    return { user: result.value.user };
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
    const result = await this.resetPasswordUseCase.execute(dto.token, dto.password);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return { message: 'Votre mot de passe a ete reinitialise avec succes.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.getMeUseCase.execute(user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileRequestDto,
  ) {
    const result = await this.updateProfileUseCase.execute(user.id, dto);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value.toJSON();
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

    this.cookieService.setAuthCookies(res, result.value.accessToken, result.value.refreshToken);

    return { user: result.value.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    this.cookieService.clearAuthCookies(res);
  }

  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  async exportData(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.exportDataUseCase.execute(user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.deleteAccountUseCase.execute(user.id);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return;
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

    // Redirect to frontend without tokens in URL
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    res.redirect(`${frontendUrl}/auth/callback`);
  }
}
