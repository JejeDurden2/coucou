import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  password!: string;
}

export class LoginRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RefreshTokenRequestDto {
  @IsString()
  refreshToken!: string;
}

export class UpdateProfileRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;
}
