import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';

const COMPARATIF_DIR = path.join(process.cwd(), 'content/comparatif');

export type ComparisonCategory =
  | 'geo-vs-marketing'
  | 'llm-vs-llm'
  | 'outil-vs-outil'
  | 'alternative';

export interface FAQ {
  question: string;
  answer: string;
}

export interface ComparisonMeta {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: ComparisonCategory;
  itemA: string;
  itemB: string;
  verdict: string;
  relatedComparisons: string[];
  relatedLexique: string[];
  author: string;
  lastUpdated: string;
  readingTime: string;
}

export interface Comparison extends ComparisonMeta {
  content: string;
  faq: FAQ[];
}

const CATEGORY_LABELS: Record<ComparisonCategory, string> = {
  'geo-vs-marketing': 'GEO vs Canaux Marketing',
  'llm-vs-llm': 'Comparatifs LLM pour la visibilité',
  'outil-vs-outil': 'Coucou IA vs Alternatives',
  alternative: 'Alternatives et meilleurs outils',
};

export function getCategoryLabel(category: ComparisonCategory): string {
  return CATEGORY_LABELS[category];
}

function ensureComparatifDir(): void {
  if (!fs.existsSync(COMPARATIF_DIR)) {
    fs.mkdirSync(COMPARATIF_DIR, { recursive: true });
  }
}

export function getAllComparisonSlugs(): string[] {
  ensureComparatifDir();
  const files = fs.readdirSync(COMPARATIF_DIR);
  return files
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

export function getAllComparisons(): ComparisonMeta[] {
  const slugs = getAllComparisonSlugs();
  const comparisons = slugs
    .map((slug) => getComparisonMeta(slug))
    .filter((comparison): comparison is ComparisonMeta => comparison !== null)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  return comparisons;
}

export function getComparisonMeta(slug: string): ComparisonMeta | null {
  ensureComparatifDir();
  const mdPath = path.join(COMPARATIF_DIR, `${slug}.md`);
  const mdxPath = path.join(COMPARATIF_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? slug,
    metaTitle: data.metaTitle ?? `${data.title ?? slug} | Coucou IA`,
    metaDescription: data.metaDescription ?? '',
    category: data.category ?? 'geo-vs-marketing',
    itemA: data.itemA ?? '',
    itemB: data.itemB ?? '',
    verdict: data.verdict ?? '',
    relatedComparisons: data.relatedComparisons ?? [],
    relatedLexique: data.relatedLexique ?? [],
    author: data.author ?? 'Coucou IA',
    lastUpdated: data.lastUpdated ?? new Date().toISOString().split('T')[0],
    readingTime: stats.text.replace('read', 'de lecture'),
  };
}

export async function getComparison(slug: string): Promise<Comparison | null> {
  ensureComparatifDir();
  const mdPath = path.join(COMPARATIF_DIR, `${slug}.md`);
  const mdxPath = path.join(COMPARATIF_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(content);
  const htmlContent = processedContent.toString();

  return {
    slug,
    title: data.title ?? slug,
    metaTitle: data.metaTitle ?? `${data.title ?? slug} | Coucou IA`,
    metaDescription: data.metaDescription ?? '',
    category: data.category ?? 'geo-vs-marketing',
    itemA: data.itemA ?? '',
    itemB: data.itemB ?? '',
    verdict: data.verdict ?? '',
    relatedComparisons: data.relatedComparisons ?? [],
    relatedLexique: data.relatedLexique ?? [],
    author: data.author ?? 'Coucou IA',
    lastUpdated: data.lastUpdated ?? new Date().toISOString().split('T')[0],
    readingTime: stats.text.replace('read', 'de lecture'),
    content: htmlContent,
    faq: data.faq ?? [],
  };
}

export function getRelatedComparisons(slug: string): ComparisonMeta[] {
  const comparison = getComparisonMeta(slug);
  if (!comparison) return [];

  const allComparisons = getAllComparisons();
  return allComparisons.filter((c) => comparison.relatedComparisons.includes(c.slug));
}

export function getComparisonsByCategory(): Record<ComparisonCategory, ComparisonMeta[]> {
  const comparisons = getAllComparisons();
  const categories: ComparisonCategory[] = [
    'geo-vs-marketing',
    'llm-vs-llm',
    'outil-vs-outil',
    'alternative',
  ];

  const grouped = categories.reduce(
    (acc, category) => {
      acc[category] = comparisons.filter((c) => c.category === category);
      return acc;
    },
    {} as Record<ComparisonCategory, ComparisonMeta[]>,
  );

  return grouped;
}
