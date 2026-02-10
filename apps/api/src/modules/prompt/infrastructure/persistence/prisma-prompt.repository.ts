import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma';
import { Prompt } from '../../domain/entities/prompt.entity';
import type {
  CreatePromptData,
  PromptRepository,
  UpdatePromptData,
} from '../../domain/repositories/prompt.repository';

@Injectable()
export class PrismaPromptRepository implements PromptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Prompt | null> {
    const prompt = await this.prisma.prompt.findUnique({ where: { id } });
    return prompt ? Prompt.from(prompt) : null;
  }

  async findByProjectId(projectId: string): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return prompts.map((p) => Prompt.from(p));
  }

  async findActiveByProjectId(projectId: string): Promise<Prompt[]> {
    const prompts = await this.prisma.prompt.findMany({
      where: { projectId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return prompts.map((p) => Prompt.from(p));
  }

  async countByProjectId(projectId: string): Promise<number> {
    return this.prisma.prompt.count({ where: { projectId } });
  }

  async create(data: CreatePromptData): Promise<Prompt> {
    const prompt = await this.prisma.prompt.create({
      data: {
        projectId: data.projectId,
        content: data.content,
        category: data.category,
      },
    });
    return Prompt.from(prompt);
  }

  async update(id: string, data: UpdatePromptData): Promise<Prompt> {
    const prompt = await this.prisma.prompt.update({
      where: { id },
      data,
    });
    return Prompt.from(prompt);
  }

  async updateLastScannedAt(id: string, date: Date): Promise<void> {
    await this.prisma.prompt.update({
      where: { id },
      data: { lastScannedAt: date },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.prompt.delete({ where: { id } });
  }
}
