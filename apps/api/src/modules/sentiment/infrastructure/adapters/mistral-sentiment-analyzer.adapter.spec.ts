import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LLMProvider } from '@prisma/client';
import type { SentimentResult } from '@coucou-ia/shared';

import { MistralSentimentAnalyzer } from './mistral-sentiment-analyzer.adapter';
import { SentimentParseError } from '../../domain';
import type { LLMPort, LLMResponse } from '../../../scan/application/ports/llm.port';
import type { LoggerService } from '../../../../common/logger';
import type { SentimentAnalysisInput } from '../../application/ports/sentiment-analyzer.port';

const mockLogger = {
  setContext: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
  verbose: vi.fn(),
} as unknown as LoggerService;

describe('MistralSentimentAnalyzer', () => {
  let analyzer: MistralSentimentAnalyzer;
  let mockLLMAdapter: {
    query: ReturnType<typeof vi.fn>;
    getProvider: ReturnType<typeof vi.fn>;
    getModel: ReturnType<typeof vi.fn>;
  };

  const validSentimentResult: SentimentResult = {
    s: 72,
    t: [
      { name: 'innovation', sentiment: 'positive', weight: 85 },
      { name: 'qualité', sentiment: 'positive', weight: 75 },
      { name: 'tech', sentiment: 'neutral', weight: 60 },
    ],
    kp: ['fiable', 'rapide', 'moderne'],
    kn: ['cher', 'complexe', 'limité'],
  };

  const defaultInput: SentimentAnalysisInput = {
    brandName: 'TestBrand',
    brandVariants: ['TB', 'Test Brand Inc'],
    domain: 'testbrand.com',
    brandContext: { businessType: 'SaaS', targetAudience: 'Developers' },
  };

  const createLLMResponse = (content: string): LLMResponse => ({
    content,
    model: 'mistral-small-latest',
    provider: LLMProvider.MISTRAL,
    latencyMs: 300,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockLLMAdapter = {
      query: vi.fn(),
      getProvider: vi.fn().mockReturnValue(LLMProvider.MISTRAL),
      getModel: vi.fn().mockReturnValue('mistral-small-latest'),
    };

    analyzer = new MistralSentimentAnalyzer(mockLLMAdapter as unknown as LLMPort, mockLogger);
  });

  describe('analyze', () => {
    it('should return Ok with valid SentimentResult on valid JSON response', async () => {
      mockLLMAdapter.query.mockResolvedValue(
        createLLMResponse(JSON.stringify(validSentimentResult)),
      );

      const result = await analyzer.analyze(defaultInput);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.s).toBe(72);
        expect(result.value.t).toEqual(['innovation', 'qualité', 'tech']);
        expect(result.value.kp).toHaveLength(3);
        expect(result.value.kn).toHaveLength(3);
      }

      expect(mockLLMAdapter.query).toHaveBeenCalledWith(
        expect.stringContaining('TestBrand'),
        expect.objectContaining({ systemPrompt: expect.any(String) }),
      );
    });

    it('should include brand variants and domain in prompt', async () => {
      mockLLMAdapter.query.mockResolvedValue(
        createLLMResponse(JSON.stringify(validSentimentResult)),
      );

      await analyzer.analyze(defaultInput);

      const prompt = mockLLMAdapter.query.mock.calls[0][0] as string;
      expect(prompt).toContain('TestBrand');
      expect(prompt).toContain('TB, Test Brand Inc');
      expect(prompt).toContain('testbrand.com');
      expect(prompt).toContain('SaaS');
    });

    it('should return Err with SentimentParseError on malformed response', async () => {
      mockLLMAdapter.query.mockResolvedValue(createLLMResponse('This is not valid JSON at all'));

      const result = await analyzer.analyze(defaultInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(SentimentParseError);
        expect(result.error.code).toBe('SENTIMENT_PARSE_ERROR');
      }
    });

    it('should return Err with SentimentParseError on API failure', async () => {
      mockLLMAdapter.query.mockRejectedValue(new Error('MISTRAL API error: 503'));

      const result = await analyzer.analyze(defaultInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(SentimentParseError);
      }
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mistral API call failed',
        expect.objectContaining({ error: 'MISTRAL API error: 503' }),
      );
    });

    it('should return Err when JSON is valid but schema validation fails', async () => {
      mockLLMAdapter.query.mockResolvedValue(createLLMResponse(JSON.stringify({ s: 75 })));

      const result = await analyzer.analyze(defaultInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(SentimentParseError);
      }
    });

    it('should extract JSON from markdown code blocks', async () => {
      const wrapped = `\`\`\`json\n${JSON.stringify(validSentimentResult)}\n\`\`\``;
      mockLLMAdapter.query.mockResolvedValue(createLLMResponse(wrapped));

      const result = await analyzer.analyze(defaultInput);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.s).toBe(72);
      }
    });

    it('should handle null brandContext in prompt', async () => {
      mockLLMAdapter.query.mockResolvedValue(
        createLLMResponse(JSON.stringify(validSentimentResult)),
      );

      const input: SentimentAnalysisInput = {
        ...defaultInput,
        brandContext: null,
      };

      const result = await analyzer.analyze(input);

      expect(result.ok).toBe(true);
      expect(mockLLMAdapter.query).toHaveBeenCalledWith(
        expect.not.stringContaining('Contexte business:'),
        expect.any(Object),
      );
    });

    it('should handle empty brandVariants in prompt', async () => {
      mockLLMAdapter.query.mockResolvedValue(
        createLLMResponse(JSON.stringify(validSentimentResult)),
      );

      const input: SentimentAnalysisInput = {
        ...defaultInput,
        brandVariants: [],
      };

      const result = await analyzer.analyze(input);

      expect(result.ok).toBe(true);
      const prompt = mockLLMAdapter.query.mock.calls[0][0] as string;
      expect(prompt).not.toContain('aussi connue comme');
    });

    it('should return Err when score is out of range', async () => {
      mockLLMAdapter.query.mockResolvedValue(
        createLLMResponse(JSON.stringify({ ...validSentimentResult, s: 150 })),
      );

      const result = await analyzer.analyze(defaultInput);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(SentimentParseError);
      }
    });
  });
});
