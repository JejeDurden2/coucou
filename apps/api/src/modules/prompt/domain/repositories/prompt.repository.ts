import type { Prompt } from '../entities/prompt.entity';

export const PROMPT_REPOSITORY = Symbol('PROMPT_REPOSITORY');

export interface CreatePromptData {
  projectId: string;
  content: string;
  category?: string;
}

export interface UpdatePromptData {
  content?: string;
  category?: string | null;
  isActive?: boolean;
}

export interface PromptRepository {
  findById(id: string): Promise<Prompt | null>;
  findByProjectId(projectId: string): Promise<Prompt[]>;
  findActiveByProjectId(projectId: string): Promise<Prompt[]>;
  countByProjectId(projectId: string): Promise<number>;
  create(data: CreatePromptData): Promise<Prompt>;
  update(id: string, data: UpdatePromptData): Promise<Prompt>;
  delete(id: string): Promise<void>;
}
