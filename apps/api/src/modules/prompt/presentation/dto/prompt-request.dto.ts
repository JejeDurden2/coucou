import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePromptRequestDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;
}

export class UpdatePromptRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
