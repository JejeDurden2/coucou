import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../prisma';
import { Project } from '../../domain/entities/project.entity';
import type {
  CreateProjectData,
  ProjectRepository,
  UpdateProjectData,
} from '../../domain/repositories/project.repository';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    return project ? Project.fromPersistence(project) : null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((p) => Project.fromPersistence(p));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.project.count({ where: { userId } });
  }

  async create(data: CreateProjectData): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        userId: data.userId,
        name: data.name,
        brandName: data.brandName,
        brandVariants: data.brandVariants,
        domain: data.domain,
      },
    });
    return Project.fromPersistence(project);
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const project = await this.prisma.project.update({
      where: { id },
      data,
    });
    return Project.fromPersistence(project);
  }

  async updateLastScannedAt(id: string, date: Date): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { lastScannedAt: date },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }
}
