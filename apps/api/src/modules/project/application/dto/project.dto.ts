export interface CreateProjectDto {
  name: string;
  brandName: string;
  brandVariants: string[];
  domain?: string;
}

export interface UpdateProjectDto {
  name?: string;
  brandName?: string;
  brandVariants?: string[];
  domain?: string | null;
}

export interface ProjectResponseDto {
  id: string;
  name: string;
  brandName: string;
  brandVariants: string[];
  domain: string | null;
  lastScannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
