import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SentimentResult } from '@coucou-ia/shared';

import { ExecuteSentimentScanUseCase } from './execute-sentiment-scan.use-case';
import { ForbiddenError, NotFoundError, Result } from '../../../../common';
import { AllSentimentProvidersFailedError, SentimentParseError, SentimentScan } from '../../domain';
import type { ProjectRepository } from '../../../project';
import type { SentimentScanRepository } from '../../domain';
import type { SentimentAnalyzerPort } from '../ports/sentiment-analyzer.port';
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
  let mockSentimentAnalyzer: { analyze: ReturnType<typeof vi.fn> };

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

  beforeEach(() => {
    vi.clearAllMocks();

    mockProjectRepository = {
      findById: vi.fn(),
    };

    mockSentimentRepository = {
      save: vi.fn(),
    };

    mockSentimentAnalyzer = {
      analyze: vi.fn(),
    };

    useCase = new ExecuteSentimentScanUseCase(
      mockProjectRepository as ProjectRepository,
      mockSentimentRepository as SentimentScanRepository,
      mockSentimentAnalyzer as unknown as SentimentAnalyzerPort,
      mockLogger,
    );
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

    it('should successfully execute sentiment analysis via Mistral', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);
      mockSentimentAnalyzer.analyze.mockResolvedValue(Result.ok(validSentimentResult));

      const savedScan = SentimentScan.fromPersistence({
        id: 'scan-123',
        projectId: 'project-123',
        scannedAt: new Date(),
        globalScore: 72,
        results: { mistral: validSentimentResult },
        createdAt: new Date(),
      });
      (mockSentimentRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(savedScan);

      const result = await useCase.execute('project-123', 'user-123');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeInstanceOf(SentimentScan);
        expect(result.value.globalScore).toBe(72);
      }

      expect(mockSentimentAnalyzer.analyze).toHaveBeenCalledWith({
        brandName: 'TestBrand',
        brandVariants: ['TestBrand Inc', 'TB'],
        domain: 'tech',
        brandContext: expect.objectContaining({
          businessType: 'SaaS',
          targetAudience: 'Developers',
        }),
      });

      expect(mockSentimentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-123',
          globalScore: 72,
          results: { mistral: validSentimentResult },
        }),
      );
    });

    it('should return error when Mistral analysis fails', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);
      mockSentimentAnalyzer.analyze.mockResolvedValue(
        Result.err(new SentimentParseError('mistral', 'API timeout')),
      );

      const result = await useCase.execute('project-123', 'user-123');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(AllSentimentProvidersFailedError);
        const error = result.error as AllSentimentProvidersFailedError;
        expect(error.failures).toHaveLength(1);
        expect(error.failures[0].provider).toBe('mistral');
      }
    });

    it('should pass brand context to analyzer when available', async () => {
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProject);
      mockSentimentAnalyzer.analyze.mockResolvedValue(Result.ok(validSentimentResult));

      const savedScan = SentimentScan.fromPersistence({
        id: 'scan-123',
        projectId: 'project-123',
        scannedAt: new Date(),
        globalScore: 72,
        results: { mistral: validSentimentResult },
        createdAt: new Date(),
      });
      (mockSentimentRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(savedScan);

      await useCase.execute('project-123', 'user-123');

      expect(mockSentimentAnalyzer.analyze).toHaveBeenCalledWith(
        expect.objectContaining({
          brandContext: expect.objectContaining({
            businessType: 'SaaS',
            targetAudience: 'Developers',
          }),
        }),
      );
    });

    it('should handle project without brand context', async () => {
      const projectNoBrandContext = {
        ...mockProject,
        brandContext: null,
      };
      (mockProjectRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        projectNoBrandContext,
      );
      mockSentimentAnalyzer.analyze.mockResolvedValue(Result.ok(validSentimentResult));

      const savedScan = SentimentScan.fromPersistence({
        id: 'scan-123',
        projectId: 'project-123',
        scannedAt: new Date(),
        globalScore: 72,
        results: { mistral: validSentimentResult },
        createdAt: new Date(),
      });
      (mockSentimentRepository.save as ReturnType<typeof vi.fn>).mockResolvedValue(savedScan);

      const result = await useCase.execute('project-123', 'user-123');

      expect(result.ok).toBe(true);
      expect(mockSentimentAnalyzer.analyze).toHaveBeenCalledWith(
        expect.objectContaining({
          brandContext: null,
        }),
      );
    });
  });
});
