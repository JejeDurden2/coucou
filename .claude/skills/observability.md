# Observability

## OpenTelemetry Setup

### Configuration ([tracing.ts](../../../apps/api/src/tracing.ts))

OpenTelemetry is **optional** and enabled when `OTEL_EXPORTER_OTLP_ENDPOINT` is set:

```typescript
// Loaded first in main.ts via: import './tracing';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (otlpEndpoint) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME || 'coucou-api',
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '0.1.0',
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers: parseOtlpHeaders(),
      compression: CompressionAlgorithm.GZIP,
      timeoutMillis: 5000,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${otlpEndpoint}/v1/metrics`,
        headers: parseOtlpHeaders(),
        compression: CompressionAlgorithm.GZIP,
        timeoutMillis: 5000,
      }),
      exportIntervalMillis: 30_000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();
  // Graceful shutdown on SIGTERM/SIGINT
}
```

### Environment Variables

```bash
# Optional — tracing only enabled when endpoint is set
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-collector:4318
OTEL_EXPORTER_OTLP_HEADERS=x-api-key=your-key,x-custom=value
SERVICE_NAME=coucou-api
```

---

## Structured Logging with Pino

### Logger Service ([logger.service.ts](../../../apps/api/src/common/logger/logger.service.ts))

```typescript
const pinoInstance: PinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  mixin() {
    // Auto-inject traceId and spanId from active OTEL span
    const span = trace.getSpan(context.active());
    if (span) {
      const { traceId, spanId } = span.spanContext();
      return { traceId, spanId };
    }
    return {};
  },
  transport: buildTransport(),
});

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private ctx?: string;

  setContext(ctx: string): void {
    this.ctx = ctx;
  }

  info(message: string, data?: Record<string, unknown>): void {
    pinoInstance.info({ context: this.ctx, ...data }, message);
  }

  error(
    message: string,
    errorOrData?: Error | Record<string, unknown>,
    data?: Record<string, unknown>,
  ): void {
    // Handles both error object and structured data
  }

  warn(message: string, data?: Record<string, unknown>): void {}
  debug(message: string, data?: Record<string, unknown>): void {}
  verbose(message: string, data?: Record<string, unknown>): void {}
}
```

### Multi-Transport Support

Logs go to:

1. **Development**: `pino-pretty` (colorized console)
2. **Production**: stdout (for Railway logs)
3. **BetterStack** (optional): when `BETTERSTACK_SOURCE_TOKEN` is set via `@logtail/pino`

```bash
LOG_LEVEL=info
BETTERSTACK_SOURCE_TOKEN=  # Optional
```

---

## Custom Spans

### withSpan Helper ([with-span.ts](../../../apps/api/src/common/tracing/with-span.ts))

```typescript
export function withSpan<T>(
  tracerName: string,
  spanName: string,
  attributes: Record<string, string | number | boolean>,
  fn: (span: Span) => Promise<T>,
): Promise<T> {
  const tracer = trace.getTracer(tracerName);
  return tracer.startActiveSpan(spanName, { attributes }, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Usage in Use Cases

```typescript
@Injectable()
export class ExecuteScanUseCase {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(ExecuteScanUseCase.name);
  }

  async execute(
    promptId: string,
    userId: string,
    plan: Plan,
  ): Promise<Result<ScanResponseDto, ExecuteScanError>> {
    return withSpan(
      'scan-module',
      'ExecuteScanUseCase.execute',
      { 'scan.promptId': promptId, 'scan.userId': userId, 'scan.plan': plan },
      async (span) => {
        this.logger.info('Executing scan', { promptId, userId });
        // ... business logic
        // Trace context (traceId, spanId) automatically added to logs
        return Result.ok(response);
      },
    );
  }
}
```

---

## Key Patterns

1. **Optional observability**: App runs fine without OTEL endpoint configured
2. **Automatic correlation**: Logger mixin injects `traceId` and `spanId` from active span
3. **Transient scope**: Each service instance gets its own logger with isolated context
4. **Structured logging**: Always use `logger.info(message, data)` not string concatenation
5. **Custom spans**: Use `withSpan()` for critical use cases (scans, billing, auth)
6. **Auto-instrumentation**: HTTP, database, Redis automatically traced when OTEL enabled
7. **Graceful shutdown**: OTEL SDK flushes on SIGTERM/SIGINT

---

## Rules

### ALWAYS

- Set logger context in constructor: `this.logger.setContext(UseCaseName.name)`
- Use structured logging: `logger.info('message', { key: value })`
- Wrap critical operations with `withSpan()` for distributed tracing
- Use appropriate log levels: `debug` (verbose), `info` (normal), `warn` (issues), `error` (failures)

### NEVER

- Log sensitive data (passwords, tokens, API keys, PII)
- Use string concatenation or template literals for data — use structured data parameter
- Skip context in logger — always call `setContext()` in constructor
- Throw from within withSpan — let it handle exceptions
