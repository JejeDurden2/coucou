import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getAllTerms, type GlossaryTermMeta } from './glossary';
import { getAllPosts, type BlogPostMeta } from './blog';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

interface TermMatcher {
  term: GlossaryTermMeta;
  patterns: string[];
}

interface AutoLinkResult {
  html: string;
  foundTerms: GlossaryTermMeta[];
}

/**
 * Build matchers for all glossary terms
 * Patterns include: term name, English name, and aliases (case-insensitive)
 */
function buildTermMatchers(): TermMatcher[] {
  const terms = getAllTerms();

  return terms.map((term) => {
    const patterns: string[] = [term.term];

    if (term.termEn && term.termEn !== term.term) {
      patterns.push(term.termEn);
    }

    patterns.push(...term.aliases);

    return { term, patterns };
  });
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Auto-link glossary terms in HTML content
 * Links first occurrence only per term, case-insensitive
 * Avoids linking inside existing <a> tags or HTML attributes
 */
export function autoLinkTermsInHtml(html: string): AutoLinkResult {
  const matchers = buildTermMatchers();
  const foundTerms: GlossaryTermMeta[] = [];
  let result = html;

  // Sort by pattern length (longest first) to avoid partial matches
  const sortedMatchers = matchers
    .flatMap((m) => m.patterns.map((p) => ({ pattern: p, term: m.term })))
    .sort((a, b) => b.pattern.length - a.pattern.length);

  const linkedSlugs = new Set<string>();

  for (const { pattern, term } of sortedMatchers) {
    // Skip if already linked this term
    if (linkedSlugs.has(term.slug)) continue;

    // Create regex for word boundaries, case-insensitive
    const regex = new RegExp(
      `(?<!<[^>]*)\\b(${escapeRegex(pattern)})\\b(?![^<]*>)(?![^<]*</a>)`,
      'i',
    );

    const match = result.match(regex);
    if (match && match.index !== undefined) {
      const before = result.slice(0, match.index);
      const after = result.slice(match.index + match[0].length);

      // Check we're not inside an <a> tag
      const lastOpenA = before.lastIndexOf('<a');
      const lastCloseA = before.lastIndexOf('</a>');

      if (lastOpenA <= lastCloseA || lastOpenA === -1) {
        const link = `<a href="/lexique/${term.slug}" class="term-link">${match[1]}</a>`;
        result = before + link + after;
        linkedSlugs.add(term.slug);
        foundTerms.push(term);
      }
    }
  }

  return { html: result, foundTerms };
}

/**
 * Find blog posts that mention a specific glossary term
 * Searches in the raw markdown content (term, termEn, aliases)
 */
export function findPostsForTerm(termSlug: string): BlogPostMeta[] {
  const terms = getAllTerms();
  const term = terms.find((t) => t.slug === termSlug);

  if (!term) return [];

  // Build search patterns
  const patterns: string[] = [term.term];
  if (term.termEn && term.termEn !== term.term) {
    patterns.push(term.termEn);
  }
  patterns.push(...term.aliases);

  const posts = getAllPosts();
  const matchingPosts: BlogPostMeta[] = [];

  for (const post of posts) {
    const mdPath = path.join(BLOG_DIR, `${post.slug}.md`);
    const mdxPath = path.join(BLOG_DIR, `${post.slug}.mdx`);
    const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

    if (!filePath) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const { content: body } = matter(content);

    // Check if any pattern matches (case-insensitive)
    const found = patterns.some((pattern) => {
      const regex = new RegExp(`\\b${escapeRegex(pattern)}\\b`, 'i');
      return regex.test(body);
    });

    if (found) {
      matchingPosts.push(post);
    }
  }

  return matchingPosts;
}
