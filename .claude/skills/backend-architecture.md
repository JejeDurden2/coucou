# Backend Architecture - NestJS + Hexagonal

## Folder Structure

```
apps/api/src/
├── modules/
│   └── [feature]/                  # e.g. auth, project, scan, billing
│       ├── domain/
│       │   ├── entities/           # Domain entities (User, Project, Scan)
│       │   ├── repositories/       # Repository interfaces (ports)
│       │   ├── errors/             # Feature-specific domain errors
│       │   └── services/           # Domain services (business logic)
│       ├── application/
│       │   ├── use-cases/          # Use cases (RegisterUseCase, CreateProjectUseCase)
│       │   ├── dto/                # Application DTOs
│       │   └── ports/              # Ports for external services (EmailPort, LLMPort)
│       ├── infrastructure/
│       │   ├── persistence/        # Prisma repositories (adapters)
│       │   ├── services/           # Infrastructure services
│       │   ├── adapters/           # External service adapters (OpenAI, Anthropic)
│       │   └── processors/         # BullMQ processors
│       └── presentation/
│           ├── controllers/        # HTTP controllers
│           ├── dto/                # Request/Response DTOs
│           ├── guards/             # Feature-specific guards
│           ├── decorators/         # Feature-specific decorators
│           └── strategies/         # Passport strategies
├── common/
│   ├── errors/                     # DomainError base + common errors
│   ├── filters/                    # AllExceptionsFilter
│   ├── interceptors/               # Global interceptors
│   ├── guards/                     # Global guards
│   ├── decorators/                 # Global decorators
│   ├── utils/                      # Result pattern, helpers
│   ├── logger/                     # LoggerService
│   ├── tracing/                    # OpenTelemetry tracing utilities
│   └── infrastructure/             # Shared infrastructure (Anthropic module)
├── infrastructure/
│   ├── queue/                      # BullMQ configuration + queue services
│   │   ├── queue.module.ts
│   │   ├── email-queue.service.ts
│   │   ├── scan-queue.service.ts
│   │   └── email.processor.ts
│   └── processors.module.ts        # Registers all BullMQ processors
├── prisma/
│   └── prisma.module.ts            # Prisma client provider
├── tracing.ts                      # OpenTelemetry SDK initialization
├── app.module.ts
└── main.ts
```

---

## Module Structure (4 Layers)

### 1. Domain Layer

Pure business logic, zero infrastructure dependencies.

**Entities** - Encapsulated domain objects with private props:

```typescript
// domain/entities/user.entity.ts
export interface UserProps {
  id: string;
  email: string;
  name: string;
  password: string | null;
  plan: Plan;
  // ...
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  static fromPersistence(data: UserProps): User {
    return new User(data);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  toJSON(): Omit<UserProps, 'password'> {
    return { ...this.props, password: undefined };
  }
}
```

**Repositories (Ports)** - Interfaces defined in domain:

```typescript
// domain/repositories/user.repository.ts
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  updatePlan(userId: string, plan: string): Promise<User>;
  delete(userId: string): Promise<void>;
}
```

**Domain Services** - Business logic that doesn't fit entities:

```typescript
// domain/services/geo-response-parser.service.ts
export class GEOResponseParserService {
  parse(llmResponse: string, brandName: string): GEOInsights {
    // Complex parsing logic
  }
}
```

### 2. Application Layer

Orchestrates domain logic, defines use cases.

**Use Cases** - Single responsibility, returns Result<T, E>:

```typescript
// application/use-cases/register.use-case.ts
@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(CONSENT_REPOSITORY)
    private readonly consentRepository: ConsentRepository,
    @Inject(EMAIL_VALIDATOR_PORT)
    private readonly emailValidator: EmailValidatorPort,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async execute(dto: RegisterDto): Promise<Result<User, ConflictError | EmailValidationError>> {
    // Validate email
    const emailResult = await this.emailValidator.validate(dto.email);
    if (!emailResult.ok) return emailResult;

    // Check existing user
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      return Result.err(new ConflictError('User', 'email', dto.email));
    }

    // Create user
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
    });

    // Log consent (RGPD)
    await this.consentRepository.logConsent({
      /* ... */
    });

    // Queue welcome email
    await this.emailQueueService.addJob({ type: 'welcome' /* ... */ });

    return Result.ok(user);
  }
}
```

**Ports** - Interfaces for external dependencies:

```typescript
// application/ports/email.port.ts
export const EMAIL_PORT = Symbol('EMAIL_PORT');

export interface EmailPort {
  send(options: SendEmailOptions): Promise<void>;
}
```

### 3. Infrastructure Layer

Implements ports with concrete adapters.

**Prisma Repositories** - Implements repository interfaces:

```typescript
// infrastructure/persistence/prisma-user.repository.ts
@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? User.fromPersistence(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({ data });
    return User.fromPersistence(user);
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Cascade delete all related entities
      await tx.project.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  }
}
```

**Adapters** - External service implementations:

```typescript
// infrastructure/adapters/resend-email.adapter.ts
@Injectable()
export class ResendEmailAdapter implements EmailPort {
  constructor(private readonly resend: Resend) {}

  async send(options: SendEmailOptions): Promise<void> {
    await this.resend.emails.send({
      from: 'noreply@example.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
```

**BullMQ Processors** - Async job handlers:

```typescript
// infrastructure/processors/email.processor.ts
@Processor('email', { concurrency: 1 })
export class EmailProcessor extends WorkerHost {
  constructor(
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<EmailJobResult> {
    const { type, to, data } = job.data;

    const config = EMAIL_CONFIG[type];
    const { html, text } = config.generator(data);

    await this.emailPort.send({ to, subject: config.subject, html, text });

    return { success: true };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error('Email job failed', error, { jobId: job.id });
  }
}
```

### 4. Presentation Layer

HTTP layer, request/response handling.

**Controllers** - Route handlers, throw HttpException:

```typescript
// presentation/controllers/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  @Post('register')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async register(@Body() dto: RegisterRequestDto, @Res() res: Response) {
    const result = await this.registerUseCase.execute(dto);

    if (!result.ok) {
      throw new HttpException(result.error.toJSON(), result.error.statusCode);
    }

    // Set auth cookies
    this.cookieService.setAuthCookies(res /* tokens */);

    return { user: result.value.toJSON() };
  }
}
```

---

## NestJS Module Configuration

### Module Wiring

```typescript
// auth.module.ts
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      /* ... */
    }),
    QueueModule, // For email queue
    forwardRef(() => BillingModule), // Circular dependency
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [
    // Use cases
    RegisterUseCase,
    LoginUseCase,
    GetMeUseCase,

    // Strategies & Guards
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,

    // Infrastructure services
    CookieService,

    // Port → Adapter bindings
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: EMAIL_VALIDATOR_PORT,
      useClass: DnsEmailValidatorService,
    },
  ],
  exports: [USER_REPOSITORY, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
```

### App Module

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    LoggerModule,
    AnthropicModule,
    QueueModule, // @Global() - BullMQ queues
    PrismaModule,
    EmailModule,
    AuthModule,
    BillingModule,
    ProjectModule,
    ScanModule,
    BullBoardConfigModule, // Queue UI
    ProcessorsModule, // Must be last - registers all processors
  ],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
```

---

## Error Handling

### DomainError Base Class

```typescript
// common/errors/domain-error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      ...(this.metadata && { details: this.metadata }),
    };
  }
}
```

### Typed Errors

```typescript
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resource: string, id: string) {
    super(`${resource} with id "${id}" not found`, { resource, id });
  }
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;

  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} "${value}" already exists`, {
      resource,
      field,
      value,
    });
  }
}

export class PlanLimitError extends DomainError {
  readonly code = 'PLAN_LIMIT_EXCEEDED';
  readonly statusCode = 403;

  constructor(resource: string, limit: number, plan: string) {
    super(`Plan limit exceeded: ${resource} limit is ${limit} for ${plan} plan`, {
      resource,
      limit,
      plan,
    });
  }
}
```

### Result Pattern

```typescript
// common/utils/result.ts
export type Result<T, E extends DomainError = DomainError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),

  err: <E extends DomainError>(error: E): Result<never, E> => ({
    ok: false,
    error,
  }),

  map: <T, U, E extends DomainError>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> =>
    result.ok ? Result.ok(fn(result.value)) : result,

  flatMap: <T, U, E extends DomainError>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> => (result.ok ? fn(result.value) : result),
};
```

### Global Exception Filter

```typescript
// common/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let body = { code: 'INTERNAL_ERROR', message: 'Internal server error' };

    if (exception instanceof DomainError) {
      status = exception.statusCode;
      body = exception.toJSON();
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = exception.getResponse();
    } else if (exception instanceof Error) {
      this.logger.error('Unhandled exception', exception, { path: request.url });
    }

    response.status(status).json({
      ...body,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

## BullMQ Queue System

### Queue Module

```typescript
// infrastructure/queue/queue.module.ts
@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'email',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { age: 86400, count: 100 },
        removeOnFail: { age: 604800 },
      },
    }),
    BullModule.registerQueue({ name: 'scan' /* ... */ }),
  ],
  providers: [EmailQueueService, ScanQueueService],
  exports: [EmailQueueService, ScanQueueService, BullModule],
})
export class QueueModule {}
```

### Queue Service

```typescript
// infrastructure/queue/email-queue.service.ts
@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async addJob(data: EmailJobData): Promise<void> {
    await this.emailQueue.add(data.type, data, {
      jobId: `email-${data.type}-${Date.now()}`,
      delay: data.delay,
    });
  }
}
```

---

## Observability

### OpenTelemetry Tracing

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (otlpEndpoint) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'coucou-api',
      [ATTR_SERVICE_VERSION]: '0.1.0',
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers: parseOtlpHeaders(),
      compression: CompressionAlgorithm.GZIP,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}
```

### Structured Logging

```typescript
// Use LoggerService everywhere
this.logger.info('Processing email job', {
  jobId: job.id,
  type,
  to,
  attempt: job.attemptsMade + 1,
});

this.logger.error('Email job failed', error, {
  jobId: job.id,
  type: job.data.type,
});
```

---

## Global Configuration (main.ts)

```typescript
// main.ts
import './tracing'; // MUST be first

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true, logger });

  // Body parser (needed for base64 screenshots)
  app.useBodyParser('json', { limit: '10mb' });

  // Security
  app.use(
    helmet({
      /* CSP, HSTS, etc. */
    }),
  );
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Global pipes, filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  await app.listen(3001);
}
```

---

## Key Architecture Rules

1. **Dependency Direction**: Domain → Application → Infrastructure → Presentation
2. **Domain Independence**: Domain layer has ZERO infrastructure imports
3. **Result Pattern**: Use cases return `Result<T, E>`, never throw
4. **Controller Layer**: Controllers convert Result to HttpException
5. **Port-Adapter Pattern**: Interfaces in domain/application, implementations in infrastructure
6. **Typed Errors**: Extend DomainError, avoid generic Error
7. **Entity Encapsulation**: Private props, getters only, factory methods
8. **Repository Pattern**: Symbol tokens + @Inject for DI
9. **Async Jobs**: Use BullMQ for emails, long-running tasks, delayed operations
10. **Observability**: OpenTelemetry tracing + structured logging with context
11. **Security**: Helmet, CORS, cookie-based auth, throttling, validation pipes
12. **RGPD Compliance**: Consent logging, anonymization, data export
