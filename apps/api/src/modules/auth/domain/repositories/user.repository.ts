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
  delete(userId: string): Promise<void>;
  anonymize(userId: string): Promise<void>;
}
