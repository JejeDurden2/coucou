import { Svg, Path, Circle } from '@react-pdf/renderer';

import { theme } from '../theme';

interface CoucouLogoProps {
  width?: number;
}

/**
 * Coucou IA logo - stylized cuckoo bird / speech bubble hybrid
 * Scalable vector version for crisp PDF rendering
 */
export function CoucouLogo({ width = 120 }: CoucouLogoProps): React.JSX.Element {
  // Logo aspect ratio is 1:1 (48x48 viewBox)
  const height = width;

  return (
    <Svg width={width} height={height} viewBox="0 0 48 48">
      {/* Body - rounded speech bubble shape */}
      <Path
        d="M8 20C8 12.268 14.268 6 22 6h4c7.732 0 14 6.268 14 14v4c0 7.732-6.268 14-14 14h-2l-6 6v-6.17C11.058 35.93 8 30.374 8 24v-4z"
        fill={theme.colors.accent}
      />

      {/* Eye - representing AI/tech */}
      <Circle cx="28" cy="20" r="4" fill={theme.colors.bgPrimary} />
      <Circle cx="29.5" cy="18.5" r="1.5" fill={theme.colors.brutalWhite} />

      {/* Beak - small triangle */}
      <Path d="M36 22l6 2-6 2v-4z" fill={theme.colors.accent} />

      {/* Wing detail - subtle arc */}
      <Path
        d="M14 22c2-4 6-6 10-6"
        stroke={theme.colors.bgPrimary}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
    </Svg>
  );
}
