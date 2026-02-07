import Image from 'next/image';

interface FeatureWithLogosProps {
  feature: string;
}

const PROVIDER_LOGOS = [
  { name: 'Mistral', pattern: /\bMistral\b/, src: '/logos/mistral.svg' },
  { name: 'ChatGPT', pattern: /\bChatGPT\b/, src: '/logos/chatgpt.svg' },
  { name: 'Claude', pattern: /\bClaude\b/, src: '/logos/claude.svg' },
] as const;

/**
 * Renders a pricing feature with provider logos if it contains AI engine names.
 * - "Mistral" -> Mistral logo + text
 * - "Mistral + ChatGPT + Claude" -> All logos + text
 */
export function FeatureWithLogos({ feature }: FeatureWithLogosProps): React.ReactNode {
  const matchedLogos = PROVIDER_LOGOS.filter(({ pattern }) => pattern.test(feature));

  if (matchedLogos.length === 0) {
    return <span>{feature}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {matchedLogos.map(({ name, src }) => (
        <Image key={name} src={src} alt={name} width={16} height={16} className="shrink-0" />
      ))}
      <span>{feature}</span>
    </span>
  );
}
