import type { Scan, LLMResult } from '../entities/scan.entity';

export const SCAN_REPOSITORY = Symbol('SCAN_REPOSITORY');

export interface CreateScanData {
  promptId: string;
  results: LLMResult[];
}

export interface ScanRepository {
  findById(id: string): Promise<Scan | null>;
  findByPromptId(promptId: string, limit?: number): Promise<Scan[]>;
  findByProjectId(projectId: string, limit?: number): Promise<Scan[]>;
  findByProjectIdInRange(projectId: string, startDate: Date, endDate: Date): Promise<Scan[]>;
  findLatestByProjectId(projectId: string): Promise<Scan | null>;
  countByProjectId(projectId: string): Promise<number>;
  countUserScansInPeriod(userId: string, since: Date): Promise<number>;
  create(data: CreateScanData): Promise<Scan>;
  deleteOlderThan(date: Date): Promise<number>;
}
