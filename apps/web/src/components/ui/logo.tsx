import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 24, text: 'text-lg' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 48, text: 'text-2xl' },
};

function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path
        d="M8 20C8 12.268 14.268 6 22 6h4c7.732 0 14 6.268 14 14v4c0 7.732-6.268 14-14 14h-2l-6 6v-6.17C11.058 35.93 8 30.374 8 24v-4z"
        fill="#06B6D4"
      />
      <circle cx="28" cy="20" r="4" fill="#080A12" />
      <circle cx="29.5" cy="18.5" r="1.5" fill="#FFFFFF" />
      <path d="M36 22l6 2-6 2v-4z" fill="#06B6D4" />
      <path
        d="M14 22c2-4 6-6 10-6"
        stroke="#080A12"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

export function Logo({ className, variant = 'full', size = 'md' }: LogoProps) {
  const { icon, text } = sizes[size];

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', className)}>
        <LogoIcon size={icon} />
      </div>
    );
  }

  if (variant === 'text') {
    return <span className={cn('font-bold text-cyan-400', text, className)}>Coucou IA</span>;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LogoIcon size={icon} />
      <span className={cn('font-bold text-cyan-400', text)}>Coucou IA</span>
    </div>
  );
}
