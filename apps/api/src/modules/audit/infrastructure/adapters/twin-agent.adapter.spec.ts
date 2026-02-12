import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AuditBrief } from '@coucou-ia/shared';

import { TwinAgentAdapter } from './twin-agent.adapter';
import { Result } from '../../../../common/utils/result';
import { AuditAgentTriggerError } from '../../domain/errors/audit.errors';
import type { ConfigService } from '@nestjs/config';
import type { LoggerService } from '../../../../common/logger';

describe('TwinAgentAdapter', () => {
  let adapter: TwinAgentAdapter;
  let mockConfigService: { get: ReturnType<typeof vi.fn> };
  let mockLogger: {
    setContext: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  const mockBrief: AuditBrief = {
    mission: 'test mission',
    brand: {
      name: 'Test Brand',
      domain: 'test.com',
      variants: [],
      context: {
        businessType: 'SaaS',
        locality: 'France',
        offerings: 'Test',
        audience: 'B2B',
      },
    },
    scanData: {
      summary: {
        totalScans: 10,
        dateRange: '2026-01-01 - 2026-01-30',
        globalCitationRate: 0.5,
        globalAvgPosition: 3,
        trend: 'stable',
      },
      byProvider: {},
      sentiment: {
        score: 0,
        themes: [],
        positiveTerms: [],
        negativeTerms: [],
        rawSummary: '',
      },
      promptResults: [],
    },
    competitors: { primary: [] },
    callback: {
      url: 'https://api.test.com/webhooks/twin',
      authHeader: 'Bearer secret',
      auditId: 'audit-123',
    },
    outputFormat: {
      schema: 'audit_result_v1',
      sections: ['geo_score'],
      language: 'fr',
    },
  };

  const originalFetch = global.fetch;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'TWIN_TRIGGER_ID') return 'trigger-abc';
        return '';
      }),
    };

    mockLogger = {
      setContext: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    adapter = new TwinAgentAdapter(
      mockConfigService as unknown as ConfigService,
      mockLogger as unknown as LoggerService,
    );

    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should set logger context on construction', () => {
    expect(mockLogger.setContext).toHaveBeenCalledWith('TwinAgentAdapter');
  });

  describe('triggerAudit', () => {
    it('should return agentId on successful first attempt', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'agent-xyz' }),
      } as Response);

      const result = await adapter.triggerAudit(mockBrief);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.agentId).toBe('agent-xyz');
      }

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://build.twin.so/triggers/trigger-abc/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockBrief),
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Twin agent triggered',
        expect.objectContaining({
          auditId: 'audit-123',
          agentId: 'agent-xyz',
          status: 'triggered',
        }),
      );
    });

    it('should retry and succeed on second attempt', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'agent-retry' }),
        } as Response);

      const result = await adapter.triggerAudit(mockBrief);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.agentId).toBe('agent-retry');
      }

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Twin agent trigger failed',
        expect.objectContaining({
          auditId: 'audit-123',
          attempt: 1,
          status: 500,
        }),
      );
    });

    it('should return error after exhausting all retries', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({ ok: false, status: 502 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response);

      const result = await adapter.triggerAudit(mockBrief);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(AuditAgentTriggerError);
        expect(result.error.code).toBe('AUDIT_AGENT_TRIGGER_ERROR');
      }

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Twin agent trigger exhausted retries',
        expect.objectContaining({
          auditId: 'audit-123',
          maxRetries: 3,
        }),
      );
    });

    it('should handle network errors and retry', async () => {
      vi.mocked(global.fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'agent-recovered' }),
        } as Response);

      const result = await adapter.triggerAudit(mockBrief);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.agentId).toBe('agent-recovered');
      }

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Twin agent trigger error',
        expect.objectContaining({
          auditId: 'audit-123',
          attempt: 1,
          error: 'Network error',
        }),
      );
    });

    it('should handle timeout errors and retry', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      vi.mocked(global.fetch)
        .mockRejectedValueOnce(abortError)
        .mockRejectedValueOnce(abortError)
        .mockRejectedValueOnce(abortError);

      const result = await adapter.triggerAudit(mockBrief);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.error).toBeInstanceOf(AuditAgentTriggerError);
      }

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle missing agentId in response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = await adapter.triggerAudit(mockBrief);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value.agentId).toBe('unknown');
      }
    });

    it('should not log the full brief payload', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'agent-xyz' }),
      } as Response);

      await adapter.triggerAudit(mockBrief);

      for (const call of mockLogger.info.mock.calls) {
        const logData = call[1] as Record<string, unknown>;
        expect(logData).not.toHaveProperty('brief');
        expect(logData).not.toHaveProperty('payload');
        expect(logData).not.toHaveProperty('body');
      }
    });
  });
});
