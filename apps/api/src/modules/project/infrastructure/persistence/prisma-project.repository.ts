import { Injectable } from '@nestjs/common';
import type { Project as PrismaProject, Prisma } from '@prisma/client';

import { PrismaService } from '../../../../prisma';
import type { BrandContext, ProjectProps } from '../../domain/entities/project.entity';
import { Project } from '../../domain/entities/project.entity';
import type {
  CreateProjectData,
  ProjectRepository,
  UpdateProjectData,
} from '../../domain/repositories/project.repository';

function mapPrismaToProjectProps(prismaProject: PrismaProject): ProjectProps {
  return {
    id: prismaProject.id,
    userId: prismaProject.userId,
    name: prismaProject.name,
    brandName: prismaProject.brandName,
    brandVariants: prismaProject.brandVariants,
    domain: prismaProject.domain,
    brandContext: prismaProject.brandContext as BrandContext | null,
    lastScannedAt: prismaProject.lastScannedAt,
    lastAutoScanAt: prismaProject.lastAutoScanAt,
    nextAutoScanAt: prismaProject.nextAutoScanAt,
    createdAt: prismaProject.createdAt,
    updatedAt: prismaProject.updatedAt,
  };
}

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    return project ? Project.fromPersistence(mapPrismaToProjectProps(project)) : null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((p) => Project.fromPersistence(mapPrismaToProjectProps(p)));
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
    return Project.fromPersistence(mapPrismaToProjectProps(project));
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const project = await this.prisma.project.update({
      where: { id },
      data: data as Prisma.ProjectUpdateInput,
    });
    return Project.fromPersistence(mapPrismaToProjectProps(project));
  }

  async updateLastScannedAt(id: string, date: Date): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { lastScannedAt: date },
    });
  }

  async updateAutoScanDates(
    id: string,
    lastAutoScanAt: Date,
    nextAutoScanAt: Date | null,
  ): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { lastAutoScanAt, nextAutoScanAt },
    });
  }

  async updateBrandContext(id: string, context: BrandContext): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: { brandContext: context as unknown as Prisma.InputJsonValue },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }
}
