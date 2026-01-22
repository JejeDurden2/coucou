'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps): React.ReactNode {
  const sanitizedContent = useMemo(() => {
    if (typeof window === 'undefined') return content;
    return DOMPurify.sanitize(content, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
    });
  }, [content]);

  return (
    <div
      className="prose prose-invert prose-zinc max-w-none
        prose-headings:font-display prose-headings:font-semibold
        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-foreground prose-strong:font-semibold
        prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:border-border
        prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:not-italic
        prose-ul:text-zinc-300 prose-ol:text-zinc-300 prose-ul:my-6 prose-ol:my-6
        prose-li:marker:text-primary prose-li:my-2
        prose-table:border-collapse prose-table:w-full prose-table:my-8
        prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-foreground
        prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2 prose-td:text-zinc-300
        prose-img:rounded-xl prose-img:border prose-img:border-border"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
