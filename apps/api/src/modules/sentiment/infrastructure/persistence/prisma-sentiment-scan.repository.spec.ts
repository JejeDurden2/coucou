import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PrismaSentimentScanRepository } from './prisma-sentiment-scan.repository';
import { SentimentScan } from '../../domain/entities/sentiment-scan.entity';
import type { PrismaService } from '../../../../prisma';
import type { SentimentScanResults } from '@coucou-ia/shared';

describe('PrismaSentimentScanRepository', () => {
  let repository: PrismaSentimentScanRepository;
  let mockPrisma: {
    sentimentScan: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  const mockResults: SentimentScanResults = {
    gpt: {
      s: 75,
      t: [
        { name: 'tech', sentiment: 'positive', weight: 85 },
        { name: 'innovation', sentiment: 'positive', weight: 75 },
      ],
      kp: ['reliable', 'fast'],
      kn: ['expensive'],
    },
    claude: {
      s: 80,
      t: [
        { name: 'tech', sentiment: 'positive', weight: 80 },
        { name: 'quality', sentiment: 'positive', weight: 90 },
      ],
      kp: ['trusted', 'efficient'],
      kn: ['complex'],
    },
  };

  const mockScanData = {
    id: 'scan-123',
    projectId: 'project-456',
    scannedAt: new Date('2026-01-15T10:00:00Z'),
    globalScore: 78,
    results: mockResults,
    createdAt: new Date('2026-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    mockPrisma = {
      sentimentScan: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    };

    repository = new PrismaSentimentScanRepository(mockPrisma as unknown as PrismaService);
  });

  describe('save', () => {
    it('should create a new sentiment scan and return domain entity', async () => {
      mockPrisma.sentimentScan.create.mockResolvedValue(mockScanData);

      const result = await repository.save({
        projectId: 'project-456',
        scannedAt: new Date('2026-01-15T10:00:00Z'),
        globalScore: 78,
        results: mockResults,
      });

      expect(mockPrisma.sentimentScan.create).toHaveBeenCalledWith({
        data: {
          projectId: 'project-456',
          scannedAt: new Date('2026-01-15T10:00:00Z'),
          globalScore: 78,
          results: mockResults,
        },
      });

      expect(result).toBeInstanceOf(SentimentScan);
      expect(result.id).toBe('scan-123');
      expect(result.projectId).toBe('project-456');
      expect(result.globalScore).toBe(78);
    });
  });

  describe('findLatestByProjectId', () => {
    it('should return the latest sentiment scan for a project', async () => {
      mockPrisma.sentimentScan.findFirst.mockResolvedValue(mockScanData);

      const result = await repository.findLatestByProjectId('project-456');

      expect(mockPrisma.sentimentScan.findFirst).toHaveBeenCalledWith({
        where: { projectId: 'project-456' },
        orderBy: { scannedAt: 'desc' },
      });

      expect(result).toBeInstanceOf(SentimentScan);
      expect(result?.id).toBe('scan-123');
    });

    it('should return null if no scan found', async () => {
      mockPrisma.sentimentScan.findFirst.mockResolvedValue(null);

      const result = await repository.findLatestByProjectId('project-789');

      expect(result).toBeNull();
    });
  });

  describe('findHistoryByProjectId', () => {
    it('should return sentiment scans sorted by scannedAt desc', async () => {
      const olderScan = {
        ...mockScanData,
        id: 'scan-100',
        scannedAt: new Date('2026-01-10T10:00:00Z'),
        globalScore: 70,
      };
      const newerScan = {
        ...mockScanData,
        id: 'scan-200',
        scannedAt: new Date('2026-01-20T10:00:00Z'),
        globalScore: 85,
      };

      mockPrisma.sentimentScan.findMany.mockResolvedValue([newerScan, olderScan]);

      const since = new Date('2026-01-01T00:00:00Z');
      const result = await repository.findHistoryByProjectId('project-456', since);

      expect(mockPrisma.sentimentScan.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 'project-456',
          scannedAt: { gte: since },
        },
        orderBy: { scannedAt: 'desc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('scan-200');
      expect(result[1].id).toBe('scan-100');
    });

    it('should return empty array if no scans found', async () => {
      mockPrisma.sentimentScan.findMany.mockResolvedValue([]);

      const result = await repository.findHistoryByProjectId(
        'project-456',
        new Date('2026-01-01T00:00:00Z'),
      );

      expect(result).toEqual([]);
    });
  });

  describe('SentimentScan entity', () => {
    it('should serialize to JSON correctly', () => {
      const scan = SentimentScan.fromPersistence(mockScanData);
      const json = scan.toJSON();

      expect(json.id).toBe('scan-123');
      expect(json.globalScore).toBe(78);
      expect(json.results).toEqual(mockResults);
    });
  });
});
