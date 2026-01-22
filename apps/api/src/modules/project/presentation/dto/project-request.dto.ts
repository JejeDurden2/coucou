import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

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
  @ArrayMaxSize(20, { message: 'Maximum 20 variantes de marque autorisees' })
  @IsString({ each: true })
  @MaxLength(100, { each: true, message: 'Chaque variante doit faire maximum 100 caracteres' })
  brandVariants!: string[];

  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'URL invalide (doit commencer par http:// ou https://)' })
  domain!: string;
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
  @ArrayMaxSize(20, { message: 'Maximum 20 variantes de marque autorisees' })
  @IsString({ each: true })
  @MaxLength(100, { each: true, message: 'Chaque variante doit faire maximum 100 caracteres' })
  brandVariants?: string[];

  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  domain?: string;
}
