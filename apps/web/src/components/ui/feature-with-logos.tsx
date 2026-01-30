import Image from 'next/image';

interface FeatureWithLogosProps {
  feature: string;
}

// Word-boundary patterns to avoid matching substrings like "ChatGPT-like"
const CHATGPT_PATTERN = /\bChatGPT\b/;
const CLAUDE_PATTERN = /\bClaude\b/;

/**
 * Renders a pricing feature with provider logos if it contains AI engine names.
 * - "ChatGPT" → ChatGPT logo + text
 * - "ChatGPT + Claude" → Both logos + text
 */
export function FeatureWithLogos({ feature }: FeatureWithLogosProps): React.ReactNode {
  const hasChatGPT = CHATGPT_PATTERN.test(feature);
  const hasClaude = CLAUDE_PATTERN.test(feature);

  if (!hasChatGPT && !hasClaude) {
    return <span>{feature}</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {hasChatGPT && (
        <Image src="/logos/chatgpt.svg" alt="ChatGPT" width={16} height={16} className="shrink-0" />
      )}
      {hasClaude && (
        <Image src="/logos/claude.svg" alt="Claude" width={16} height={16} className="shrink-0" />
      )}
      <span>{feature}</span>
    </span>
  );
}
