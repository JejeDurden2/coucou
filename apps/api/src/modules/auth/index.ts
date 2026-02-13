// NOTE: Decorators and guards MUST be exported before AuthModule to avoid
// circular-dependency issues (AuthModule → BillingModule → ... → controllers
// that import CurrentUser from this barrel).
export { CurrentUser } from './presentation/decorators/current-user.decorator';
export { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
export type { AuthenticatedUser } from './application/dto/auth.dto';
export { User, USER_REPOSITORY } from './domain';
export type { UserRepository, UserEmailPrefs } from './domain';
export { AuthModule } from './auth.module';
