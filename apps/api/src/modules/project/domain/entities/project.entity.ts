export interface BrandContext {
  businessType: string;
  locality: string | null;
  mainOfferings: string[];
  targetAudience: string;
  extractedAt: string;
}

export interface ProjectProps {
  id: string;
  userId: string;
  name: string;
  brandName: string;
  brandVariants: string[];
  domain: string;
  brandContext: BrandContext | null;
  lastScannedAt: Date | null;
  lastAutoScanAt: Date | null;
  nextAutoScanAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private constructor(private readonly props: ProjectProps) {}

  static from(props: ProjectProps): Project {
    return new Project(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get brandName(): string {
    return this.props.brandName;
  }

  get brandVariants(): string[] {
    return this.props.brandVariants;
  }

  get domain(): string {
    return this.props.domain;
  }

  get brandContext(): BrandContext | null {
    return this.props.brandContext;
  }

  get lastScannedAt(): Date | null {
    return this.props.lastScannedAt;
  }

  get lastAutoScanAt(): Date | null {
    return this.props.lastAutoScanAt;
  }

  get nextAutoScanAt(): Date | null {
    return this.props.nextAutoScanAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  belongsTo(userId: string): boolean {
    return this.props.userId === userId;
  }

  toJSON(): ProjectProps {
    return { ...this.props };
  }
}
