import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import readingTime from 'reading-time';

const GEO_POUR_DIR = path.join(process.cwd(), 'content/geo-pour');

export interface FAQ {
  question: string;
  answer: string;
}

export interface UseCase {
  title: string;
  description: string;
}

export interface PersonaMeta {
  slug: string;
  persona: string;
  headline: string;
  metaTitle: string;
  metaDescription: string;
  painPoints: string[];
  benefits: string[];
  relatedPersonas: string[];
  relatedLexique: string[];
  lastUpdated: string;
  readingTime: string;
}

export interface Persona extends PersonaMeta {
  content: string;
  faq: FAQ[];
  useCases: UseCase[];
}

function ensureGeoPourDir(): void {
  if (!fs.existsSync(GEO_POUR_DIR)) {
    fs.mkdirSync(GEO_POUR_DIR, { recursive: true });
  }
}

export function getAllPersonaSlugs(): string[] {
  ensureGeoPourDir();
  const files = fs.readdirSync(GEO_POUR_DIR);
  return files
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

export function getAllPersonas(): PersonaMeta[] {
  const slugs = getAllPersonaSlugs();
  const personas = slugs
    .map((slug) => getPersonaMeta(slug))
    .filter((persona): persona is PersonaMeta => persona !== null);

  return personas;
}

export function getPersonaMeta(slug: string): PersonaMeta | null {
  ensureGeoPourDir();
  const mdPath = path.join(GEO_POUR_DIR, `${slug}.md`);
  const mdxPath = path.join(GEO_POUR_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  return {
    slug,
    persona: data.persona ?? slug,
    headline: data.headline ?? `GEO pour ${data.persona ?? slug}`,
    metaTitle: data.metaTitle ?? `GEO pour ${data.persona ?? slug} | Coucou IA`,
    metaDescription: data.metaDescription ?? '',
    painPoints: data.painPoints ?? [],
    benefits: data.benefits ?? [],
    relatedPersonas: data.relatedPersonas ?? [],
    relatedLexique: data.relatedLexique ?? [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString().split('T')[0],
    readingTime: stats.text.replace('read', 'de lecture'),
  };
}

export async function getPersona(slug: string): Promise<Persona | null> {
  ensureGeoPourDir();
  const mdPath = path.join(GEO_POUR_DIR, `${slug}.md`);
  const mdxPath = path.join(GEO_POUR_DIR, `${slug}.mdx`);

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
    persona: data.persona ?? slug,
    headline: data.headline ?? `GEO pour ${data.persona ?? slug}`,
    metaTitle: data.metaTitle ?? `GEO pour ${data.persona ?? slug} | Coucou IA`,
    metaDescription: data.metaDescription ?? '',
    painPoints: data.painPoints ?? [],
    benefits: data.benefits ?? [],
    relatedPersonas: data.relatedPersonas ?? [],
    relatedLexique: data.relatedLexique ?? [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString().split('T')[0],
    readingTime: stats.text.replace('read', 'de lecture'),
    content: htmlContent,
    faq: data.faq ?? [],
    useCases: data.useCases ?? [],
  };
}

export function getRelatedPersonas(slug: string): PersonaMeta[] {
  const persona = getPersonaMeta(slug);
  if (!persona) return [];

  const allPersonas = getAllPersonas();
  return allPersonas.filter((p) => persona.relatedPersonas.includes(p.slug));
}
