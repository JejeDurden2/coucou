import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User } from 'lucide-react';

import type { BlogPostMeta } from '@/lib/blog';

interface PostCardProps {
  post: BlogPostMeta;
}

export function PostCard({ post }: PostCardProps): React.ReactNode {
  const formattedDate = new Date(post.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <article className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
      <Link href={`/blog/${post.slug}`} className="block space-y-4">
        {post.image && (
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={675}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        <div className="space-y-3">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" aria-hidden="true" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {post.readingTime}
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5" aria-hidden="true" />
              {post.author}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
