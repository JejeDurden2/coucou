import { IsArray, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateProjectRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brandName!: string;

  @IsArray()
  @IsString({ each: true })
  brandVariants!: string[];

  @IsOptional()
  @IsUrl()
  domain?: string;
}

export class UpdateProjectRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brandName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandVariants?: string[];

  @IsOptional()
  @IsUrl()
  domain?: string | null;
}
