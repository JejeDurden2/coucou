export interface CreatePromptDto {
  content: string;
  category?: string;
}

export interface UpdatePromptDto {
  content?: string;
  category?: string | null;
  isActive?: boolean;
}

export interface PromptResponseDto {
  id: string;
  projectId: string;
  content: string;
  category: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
