export interface PromptProps {
  id: string;
  projectId: string;
  content: string;
  category: string | null;
  isActive: boolean;
  lastScannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Prompt {
  private constructor(private readonly props: PromptProps) {}

  static create(props: PromptProps): Prompt {
    return new Prompt(props);
  }

  static fromPersistence(data: PromptProps): Prompt {
    return new Prompt(data);
  }

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get content(): string {
    return this.props.content;
  }

  get category(): string | null {
    return this.props.category;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastScannedAt(): Date | null {
    return this.props.lastScannedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): PromptProps {
    return { ...this.props };
  }
}
