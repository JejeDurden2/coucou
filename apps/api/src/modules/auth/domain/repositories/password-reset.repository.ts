export const PASSWORD_RESET_REPOSITORY = Symbol('PASSWORD_RESET_REPOSITORY');

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface PasswordResetRepository {
  create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetToken | null>;
  markAsUsed(id: string): Promise<void>;
  deleteExpiredTokens(userId: string): Promise<void>;
  /**
   * Atomically validates and marks a token as used in a single transaction.
   * Returns the token if valid and successfully marked, null otherwise.
   * Prevents TOCTOU race conditions.
   */
  consumeToken(token: string): Promise<PasswordResetToken | null>;
}
