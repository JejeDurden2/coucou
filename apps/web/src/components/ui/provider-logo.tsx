import Image from 'next/image';
import type { JSX } from 'react';

import { getDisplayNameForProvider, getLogoForProvider, LLMProvider } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

interface ProviderLogoProps {
  provider: LLMProvider;
  size?: LogoSize;
  className?: string;
}

const SIZE_TO_PIXELS: Record<LogoSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function ProviderLogo({ provider, size = 'md', className }: ProviderLogoProps): JSX.Element {
  const pixelSize = SIZE_TO_PIXELS[size];

  return (
    <Image
      src={getLogoForProvider(provider)}
      alt={getDisplayNameForProvider(provider)}
      width={pixelSize}
      height={pixelSize}
      className={cn('rounded-sm', className)}
    />
  );
}
