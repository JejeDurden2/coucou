import type { Plan } from '@prisma/client';

export interface UserProps {
  id: string;
  email: string;
  name: string;
  password: string | null;
  googleId: string | null;
  avatarUrl: string | null;
  plan: Plan;
  stripeCustomerId: string | null;
  emailNotificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static from(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get password(): string | null {
    return this.props.password;
  }

  get googleId(): string | null {
    return this.props.googleId;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get plan(): Plan {
    return this.props.plan;
  }

  get stripeCustomerId(): string | null {
    return this.props.stripeCustomerId;
  }

  get emailNotificationsEnabled(): boolean {
    return this.props.emailNotificationsEnabled;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toJSON(): Omit<UserProps, 'password'> {
    return {
      id: this.props.id,
      email: this.props.email,
      name: this.props.name,
      googleId: this.props.googleId,
      avatarUrl: this.props.avatarUrl,
      plan: this.props.plan,
      stripeCustomerId: this.props.stripeCustomerId,
      emailNotificationsEnabled: this.props.emailNotificationsEnabled,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
