import type { Plan } from '@prisma/client';

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  projectCount: number;
  emailNotificationsEnabled: boolean;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  plan: Plan;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  plan: Plan;
}
