import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable OTEL diagnostics to debug export issues
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

function parseOtlpHeaders(): Record<string, string> | undefined {
  const headersEnv = process.env.OTEL_EXPORTER_OTLP_HEADERS;
  if (!headersEnv) return undefined;

  const headers: Record<string, string> = {};
  for (const pair of headersEnv.split(',')) {
    const [key, ...valueParts] = pair.split('=');
    if (key && valueParts.length > 0) {
      headers[key.trim()] = valueParts.join('=').trim();
    }
  }
  return Object.keys(headers).length > 0 ? headers : undefined;
}

if (otlpEndpoint) {
  const headers = parseOtlpHeaders();

  console.warn('[Tracing] Initializing OpenTelemetry SDK');
  console.warn(`[Tracing] Endpoint: ${otlpEndpoint}`);
  console.warn(`[Tracing] Headers: ${headers ? Object.keys(headers).join(', ') : 'none'}`);

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME || 'coucou-api',
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '0.1.0',
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers,
      compression: CompressionAlgorithm.GZIP,
      timeoutMillis: 5000,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${otlpEndpoint}/v1/metrics`,
        headers,
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

  try {
    sdk.start();
    console.warn('[Tracing] OpenTelemetry SDK started');
  } catch (err) {
    console.error('[Tracing] Failed to start OpenTelemetry SDK, continuing without tracing', err);
  }

  async function shutdown(): Promise<void> {
    try {
      await sdk.shutdown();
    } catch (err) {
      console.error('Error shutting down OTEL SDK', err);
    }
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} else {
  console.warn('[Tracing] OpenTelemetry disabled (OTEL_EXPORTER_OTLP_ENDPOINT not set)');
}
