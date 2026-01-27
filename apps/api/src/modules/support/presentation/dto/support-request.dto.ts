import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

import type { SupportCategory } from '@coucou-ia/shared';

export class SupportRequestDto {
  @IsEnum(['bug', 'question', 'billing', 'other'])
  category!: SupportCategory;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsString()
  screenshot?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
}
