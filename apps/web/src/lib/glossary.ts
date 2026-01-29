import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';

const LEXIQUE_DIR = path.join(process.cwd(), 'content/lexique');

export type GlossaryCategory =
  | 'geo-fondamentaux'
  | 'metriques'
  | 'technique'
  | 'strategie'
  | 'comparaison';

export interface FAQ {
  question: string;
  answer: string;
}

export interface GlossaryTermMeta {
  slug: string;
  term: string;
  termEn?: string;
  aliases: string[];
  category: GlossaryCategory;
  definition: string;
  relatedTerms: string[];
  lastUpdated: string;
  readingTime: string;
}

export interface GlossaryTerm extends GlossaryTermMeta {
  content: string;
  faq: FAQ[];
}

const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  'geo-fondamentaux': 'GEO Fondamentaux',
  metriques: 'Métriques',
  technique: 'Technique',
  strategie: 'Stratégie',
  comparaison: 'Comparaisons',
};

export function getCategoryLabel(category: GlossaryCategory): string {
  return CATEGORY_LABELS[category];
}

function ensureLexiqueDir(): void {
  if (!fs.existsSync(LEXIQUE_DIR)) {
    fs.mkdirSync(LEXIQUE_DIR, { recursive: true });
  }
}

export function getAllTermSlugs(): string[] {
  ensureLexiqueDir();
  const files = fs.readdirSync(LEXIQUE_DIR);
  return files
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

export function getAllTerms(): GlossaryTermMeta[] {
  const slugs = getAllTermSlugs();
  const terms = slugs
    .map((slug) => getTermMeta(slug))
    .filter((term): term is GlossaryTermMeta => term !== null)
    .sort((a, b) => a.term.localeCompare(b.term, 'fr'));

  return terms;
}

export function getTermsByCategory(): Record<GlossaryCategory, GlossaryTermMeta[]> {
  const terms = getAllTerms();
  const categories: GlossaryCategory[] = [
    'geo-fondamentaux',
    'metriques',
    'technique',
    'strategie',
    'comparaison',
  ];

  const grouped = categories.reduce(
    (acc, category) => {
      acc[category] = terms.filter((t) => t.category === category);
      return acc;
    },
    {} as Record<GlossaryCategory, GlossaryTermMeta[]>,
  );

  return grouped;
}

export function getTermMeta(slug: string): GlossaryTermMeta | null {
  ensureLexiqueDir();
  const mdPath = path.join(LEXIQUE_DIR, `${slug}.md`);
  const mdxPath = path.join(LEXIQUE_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  return {
    slug,
    term: data.term ?? slug,
    termEn: data.termEn,
    aliases: data.aliases ?? [],
    category: data.category ?? 'geo-fondamentaux',
    definition: data.definition ?? '',
    relatedTerms: data.relatedTerms ?? [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString().split('T')[0],
    readingTime: stats.text.replace('read', 'de lecture'),
  };
}

export async function getTerm(slug: string): Promise<GlossaryTerm | null> {
  ensureLexiqueDir();
  const mdPath = path.join(LEXIQUE_DIR, `${slug}.md`);
  const mdxPath = path.join(LEXIQUE_DIR, `${slug}.mdx`);

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
    term: data.term ?? slug,
    termEn: data.termEn,
    aliases: data.aliases ?? [],
    category: data.category ?? 'geo-fondamentaux',
    definition: data.definition ?? '',
    relatedTerms: data.relatedTerms ?? [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString().split('T')[0],
    readingTime: stats.text.replace('read', 'de lecture'),
    content: htmlContent,
    faq: data.faq ?? [],
  };
}

export function getRelatedTerms(slug: string): GlossaryTermMeta[] {
  const term = getTermMeta(slug);
  if (!term) return [];

  const allTerms = getAllTerms();
  return allTerms.filter((t) => term.relatedTerms.includes(t.slug));
}
