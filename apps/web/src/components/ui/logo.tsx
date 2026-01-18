'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { wrapper: 'h-8', emoji: 'text-xl', text: 'text-lg' },
  md: { wrapper: 'h-10', emoji: 'text-2xl', text: 'text-xl' },
  lg: { wrapper: 'h-14', emoji: 'text-4xl', text: 'text-2xl' },
};

function WaveEmoji({ className, onAnimationEnd }: { className?: string; onAnimationEnd?: () => void }) {
  return (
    <span
      className={cn('inline-block origin-[70%_70%]', className)}
      onAnimationEnd={onAnimationEnd}
      role="img"
      aria-label="Main qui salue"
    >
      👋
    </span>
  );
}

export function Logo({ className, variant = 'full', size = 'md' }: LogoProps) {
  const [isWaving, setIsWaving] = useState(false);
  const { wrapper, emoji, text } = sizes[size];

  const handleMouseEnter = useCallback(() => {
    setIsWaving(true);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setIsWaving(false);
  }, []);

  if (variant === 'icon') {
    return (
      <div
        className={cn('flex items-center', wrapper, className)}
        onMouseEnter={handleMouseEnter}
      >
        <WaveEmoji
          className={cn(emoji, isWaving && 'animate-wave')}
          onAnimationEnd={handleAnimationEnd}
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span
        className={cn(
          'font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent',
          text,
          className,
        )}
      >
        Coucou IA
      </span>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-2', wrapper, className)}
      onMouseEnter={handleMouseEnter}
    >
      <WaveEmoji
        className={cn(emoji, isWaving && 'animate-wave')}
        onAnimationEnd={handleAnimationEnd}
      />
      <span
        className={cn(
          'font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent',
          text,
        )}
      >
        Coucou IA
      </span>
    </div>
  );
}
