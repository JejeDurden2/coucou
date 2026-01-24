export interface CreateProjectDto {
  name: string;
  brandName: string;
  brandVariants: string[];
  domain: string;
}

export interface UpdateProjectDto {
  name?: string;
  brandName?: string;
  brandVariants?: string[];
  domain?: string;
}

export interface ProjectResponseDto {
  id: string;
  name: string;
  brandName: string;
  brandVariants: string[];
  domain: string;
  lastScannedAt: Date | null;
  lastAutoScanAt: Date | null;
  nextAutoScanAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
