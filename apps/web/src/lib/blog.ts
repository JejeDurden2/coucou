import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

function ensureBlogDir(): void {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
}

export function getAllPostSlugs(): string[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR);
  return files
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx?$/, ''));
}

export function getAllPosts(): BlogPostMeta[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => getPostMeta(slug))
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostMeta(slug: string): BlogPostMeta | null {
  ensureBlogDir();
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title ?? 'Sans titre',
    description: data.description ?? '',
    date: data.date ?? new Date().toISOString(),
    author: data.author ?? 'Coucou IA',
    tags: data.tags ?? [],
    image: data.image,
    readingTime: stats.text.replace('read', 'de lecture'),
  };
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  ensureBlogDir();
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  const processedContent = await remark().use(html).process(content);
  const htmlContent = processedContent.toString();

  return {
    slug,
    title: data.title ?? 'Sans titre',
    description: data.description ?? '',
    date: data.date ?? new Date().toISOString(),
    author: data.author ?? 'Coucou IA',
    tags: data.tags ?? [],
    image: data.image,
    readingTime: stats.text.replace('read', 'de lecture'),
    content: htmlContent,
  };
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
  );
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagsSet = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tagsSet.add(tag)));
  return Array.from(tagsSet).sort();
}
