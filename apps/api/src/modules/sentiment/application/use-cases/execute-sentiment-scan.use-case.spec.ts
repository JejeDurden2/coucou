import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SentimentResult } from '@coucou-ia/shared';
import { LLMProvider } from '@prisma/client';

import { ExecuteSentimentScanUseCase } from './execute-sentiment-scan.use-case';
import { ForbiddenError, NotFoundError } from '../../../../common';
import { AllSentimentProvidersFailedError, SentimentScan } from '../../domain';
import type { ProjectRepository } from '../../../project';
import type { SentimentScanRepository } from '../../domain';
import type { LLMResponse } from '../../../scan';
import type { GPT52LLMAdapter } from '../../../scan/infrastructure/adapters/gpt52-llm.adapter';
import type { AnthropicClientService } from '../../../../common/infrastructure/anthropic/anthropic-client.service';
import type { LoggerService } from '../../../../common/logger';

const mockLogger = {
  setContext: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
  verbose: vi.fn(),
} as unknown as LoggerService;

describe('ExecuteSentimentScanUseCase', () => {
  let useCase: ExecuteSentimentScanUseCase;
  let mockProjectRepository: Partial<ProjectRepository>;
  let mockSentimentRepository: Partial<SentimentScanRepository>;
  let mockGpt52Adapter: {
    query: ReturnType<typeof vi.fn>;
    getProvider: ReturnType<typeof vi.fn>;
    getModel: ReturnType<typeof vi.fn>;
  };
  let mockAnthropicClient: {
    createMessage: ReturnType<typeof vi.fn>;
    extractJson: ReturnType<typeof vi.fn>;
  };

  const mockProject = {
    id: 'project-123',
    userId: 'user-123',
    name: 'Test Project',
    brandName: 'TestBrand',
    brandVariants: ['TestBrand Inc', 'TB'],
    domain: 'tech',
    brandContext: {
      businessType: 'SaaS',
      locality: null,
      mainOfferings: ['Software'],
      targetAudience: 'Developers',
      extractedAt: '2026-01-15T00:00:00Z',
    },
    lastScannedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    belongsTo: vi.fn((userId: string) => userId === 'user-123'),
    toJSON: vi.fn(),
  };

  const validGptResult: SentimentResult = {
    s: 75,
    t: ['innovation', 'qualité', 'tech'],
    kp: ['fiable', 'rapide', 'moderne'],
    kn: ['cher', 'complexe', 'limité'],
  };

  const validClaudeResult: SentimentResult = {
    s: 85,
    t: ['tech', 'efficacité', 'design'],
    kp: ['intuitif', 'puissant', 'stable'],
    kn: ['prix', 'documentation', 'support'],
  };

  const createLLMResponse = (
    content: string,
    provider: LLMProvider = LLMProvider.OPENAI,
  ): LLMResponse => ({
    content,
    model: provider === LLMProvider.OPENAI ? 'gpt-5.2' : 'claude-sonnet-4-5',
    provider,
    latencyMs: 500,
  });

  beforeEach(() => {
    vi.useFakeTimers();

    mockProjectRepository = {
      findById: vi.fn(),
    };

    mockSentimentRepository = {
      save: vi.fn(),
    };

    mockGpt52Adapter = {
      query: vi.fn(),
      getProvider: vi.fn().mockReturnValue(LLMProvider.OPENAI),
      getModel: vi.fn().mockReturnValue('gpt-5.2'),
    };

    mockAnthropicClient = {
      createMessage: vi.fn(),
      extractJson: vi.fn(),
    };

    useCase = new ExecuteSentimentScanUseCase(
      mockProjectRepository as ProjectRepository,
      mockSentimentRepository as SentimentScanRepository,
      mockGpt52Adapter as unknown as GPT52LLMAdapter,
      mockAnthropicClient as unknown as AnthropicClientService,
      mockLogger,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('execute', () => {
    it('should return error if project not found', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await useCase.execute('project-123', 'user-123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotFoundError);
        expect(result.error.message).toContain('project-123');
      }
    });

    it('should return error if user does not own project', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);

      const result = await useCase.execute('project-123', 'other-user');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(ForbiddenError);
      }
    });

    it('should successfully execute with both LLMs and calculate average score', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);
      (mockGpt52Adapter.query as ReturnType<typeof vi.fn>).mockResolvedValue(
        createLLMResponse(JSON.stringify(validGptResult), LLMProvider.OPENAI),
      );
      mockAnthropicClient.createMessage.mockResolvedValue({
        text: JSON.stringify(validClaudeResult),
        model: 'claude-sonnet-4-5-20250929',
        inputTokens: 100,
        outputTokens: 50,
      });
      mockAnthropicClient.extractJson.mockReturnValue(validClaudeResult);

      const savedScan = SentimentScan.fromPersistence({
        id: 'scan-123',
        projectId: 'project-123',
        scannedAt: new Date(),
        globalScore: 80, // (75 + 85) / 2
        results: { gpt: validGptResult, claude: validClaudeResult },
        createdAt: new Date(),
      });
      (mockSentimentRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(savedScan);

      const result = await useCase.execute('project-123', 'user-123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeInstanceOf(SentimentScan);
        expect(result.value.globalScore).toBe(80);
      }

      expect(mockSentimentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-123',
          globalScore: 80,
          results: {
            gpt: validGptResult,
            claude: validClaudeResult,
          },
        }),
      );

      // Verify Claude was called with web search enabled
      expect(mockAnthropicClient.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          webSearch: true,
          model: 'claude-sonnet-4-5-20250929',
          temperature: 0,
        }),
      );
    });

    it('should succeed with single LLM when Claude fails', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);
      (mockGpt52Adapter.query as ReturnType<typeof vi.fn>).mockResolvedValue(
        createLLMResponse(JSON.stringify(validGptResult), LLMProvider.OPENAI),
      );
      mockAnthropicClient.createMessage.mockRejectedValue(new Error('API timeout'));

      const savedScan = SentimentScan.fromPersistence({
        id: 'scan-123',
        projectId: 'project-123',
        scannedAt: new Date(),
        globalScore: 75, // Only GPT score
        results: { gpt: validGptResult, claude: { s: 0, t: [], kp: [], kn: [] } },
        createdAt: new Date(),
      });
      (mockSentimentRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(savedScan);

      const promise = useCase.execute('project-123', 'user-123');
      await vi.advanceTimersByTimeAsync(5000);
      const result = await promise;

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.globalScore).toBe(75);
      }
    });

    it('should retry on malformed JSON from GPT and succeed on second attempt', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);

      // GPT: first call returns malformed JSON, second returns valid
      (mockGpt52Adapter.query as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(createLLMResponse('not valid json', LLMProvider.OPENAI))
        .mockResolvedValueOnce(
          createLLMResponse(JSON.stringify(validGptResult), LLMProvider.OPENAI),
        );

      mockAnthropicClient.createMessage.mockResolvedValue({
        text: JSON.stringify(validClaudeResult),
        model: 'claude-sonnet-4-5-20250929',
        inputTokens: 100,
        outputTokens: 50,
      });
      mockAnthropicClient.extractJson.mockReturnValue(validClaudeResult);

      const savedScan = SentimentScan.fromPersistence({
        id: 'scan-123',
        projectId: 'project-123',
        scannedAt: new Date(),
        globalScore: 80,
        results: { gpt: validGptResult, claude: validClaudeResult },
        createdAt: new Date(),
      });
      (mockSentimentRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(savedScan);

      const result = await useCase.execute('project-123', 'user-123');

      expect(result.ok).toBe(true);
      expect(mockGpt52Adapter.query).toHaveBeenCalledTimes(2);
    });

    it('should return error when both LLMs fail', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);
      (mockGpt52Adapter.query as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('GPT API error'),
      );
      mockAnthropicClient.createMessage.mockRejectedValue(new Error('Claude API error'));

      const promise = useCase.execute('project-123', 'user-123');
      await vi.advanceTimersByTimeAsync(5000);
      const result = await promise;

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AllSentimentProvidersFailedError);
        const error = result.error as AllSentimentProvidersFailedError;
        expect(error.failures).toHaveLength(2);
      }
    });

    it('should parse JSON wrapped in markdown code blocks from GPT', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);

      const wrappedJson = `\`\`\`json
${JSON.stringify(validGptResult)}
\`\`\``;

      (mockGpt52Adapter.query as ReturnType<typeof vi.fn>).mockResolvedValue(
        createLLMResponse(wrappedJson, LLMProvider.OPENAI),
      );
      mockAnthropicClient.createMessage.mockResolvedValue({
        text: JSON.stringify(validClaudeResult),
        model: 'claude-sonnet-4-5-20250929',
        inputTokens: 100,
        outputTokens: 50,
      });
      mockAnthropicClient.extractJson.mockReturnValue(validClaudeResult);

      const savedScan = SentimentScan.fromPersistence({
        id: 'scan-123',
        projectId: 'project-123',
        scannedAt: new Date(),
        globalScore: 80,
        results: { gpt: validGptResult, claude: validClaudeResult },
        createdAt: new Date(),
      });
      (mockSentimentRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(savedScan);

      const result = await useCase.execute('project-123', 'user-123');

      expect(result.ok).toBe(true);
    });
  });
});
