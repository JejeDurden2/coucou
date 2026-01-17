import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { AuthenticatedUser } from '../../application/dto/auth.dto';
import {
  GetMeUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
} from '../../application/use-cases';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
} from '../dto/auth-request.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Post('register')
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenRequestDto) {
    const result = await this.refreshTokenUseCase.execute(dto.refreshToken);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    return result.value;
  }
}
