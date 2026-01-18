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
  GetMeUseCase,
  GoogleAuthUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
  UpdateProfileUseCase,
} from '../../application/use-cases';
import type { GoogleProfile } from '../strategies/google.strategy';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
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
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  async register(@Body() dto: RegisterRequestDto) {
    const result = await this.registerUseCase.execute(dto);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return {
      message: 'User registered successfully',
      user: result.value.toJSON(),
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  async login(@Body() dto: LoginRequestDto) {
    const result = await this.loginUseCase.execute(dto);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
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
  async refresh(@Body() dto: RefreshTokenRequestDto) {
    const result = await this.refreshTokenUseCase.execute(dto.refreshToken);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
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

    // Redirect to frontend with tokens
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const callbackUrl = new URL('/auth/callback', frontendUrl);
    callbackUrl.searchParams.set('accessToken', accessToken);
    callbackUrl.searchParams.set('refreshToken', refreshToken);

    res.redirect(callbackUrl.toString());
  }
}
