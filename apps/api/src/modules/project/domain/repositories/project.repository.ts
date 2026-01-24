import type { BrandContext, Project } from '../entities/project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface CreateProjectData {
  userId: string;
  name: string;
  brandName: string;
  brandVariants: string[];
  domain: string;
}

export interface UpdateProjectData {
  name?: string;
  brandName?: string;
  brandVariants?: string[];
  domain?: string;
}

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  countByUserId(userId: string): Promise<number>;
  create(data: CreateProjectData): Promise<Project>;
  update(id: string, data: UpdateProjectData): Promise<Project>;
  updateLastScannedAt(id: string, date: Date): Promise<void>;
  updateAutoScanDates(id: string, lastAutoScanAt: Date, nextAutoScanAt: Date | null): Promise<void>;
  updateBrandContext(id: string, context: BrandContext): Promise<void>;
  delete(id: string): Promise<void>;
}
