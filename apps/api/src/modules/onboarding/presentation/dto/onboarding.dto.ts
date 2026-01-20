import { IsString, IsNotEmpty } from 'class-validator';

export class GeneratePromptsRequestDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;
}

export interface GeneratePromptsResponseDto {
  prompts: {
    id: string;
    projectId: string;
    content: string;
    category: string | null;
    isActive: boolean;
    lastScannedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
