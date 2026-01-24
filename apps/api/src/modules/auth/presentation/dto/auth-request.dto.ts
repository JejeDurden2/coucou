import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
  Equals,
  IsOptional,
} from 'class-validator';

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

  @IsBoolean()
  @Equals(true, { message: 'Vous devez accepter les conditions générales' })
  acceptTerms!: boolean;
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
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsBoolean()
  emailNotificationsEnabled?: boolean;
}

export class ForgotPasswordRequestDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordRequestDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  password!: string;
}

export class DeleteAccountRequestDto {
  @IsString()
  @Matches(/^SUPPRIMER$/, {
    message: 'Le texte de confirmation doit être "SUPPRIMER"',
  })
  confirmation!: string;
}
