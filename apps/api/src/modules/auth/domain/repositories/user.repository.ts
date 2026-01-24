import type { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

export interface CreateOAuthUserData {
  email: string;
  name: string;
  googleId: string;
  avatarUrl?: string;
}

export interface UserEmailPrefs {
  email: string;
  name: string;
  emailNotificationsEnabled: boolean;
  lastPostScanEmailAt: Date | null;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  createFromOAuth(data: CreateOAuthUserData): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string, avatarUrl?: string): Promise<User>;
  updatePlan(userId: string, plan: string, stripeCustomerId?: string): Promise<User>;
  updateName(userId: string, name: string): Promise<User>;
  updatePassword(userId: string, hashedPassword: string): Promise<User>;
  updateLastScanAt(userId: string, date: Date): Promise<void>;
  findByIdWithEmailPrefs(userId: string): Promise<UserEmailPrefs | null>;
  updateLastPostScanEmailAt(userId: string, date: Date): Promise<void>;
  updateEmailNotificationsEnabled(userId: string, enabled: boolean): Promise<void>;
  delete(userId: string): Promise<void>;
  anonymize(userId: string): Promise<void>;
}
