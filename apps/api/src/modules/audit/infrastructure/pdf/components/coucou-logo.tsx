import { LogoSvg } from '../assets/logo-svg';

interface CoucouLogoProps {
  width?: number;
}

/**
 * Coucou IA logo component
 * Uses SVG for crisp rendering at any size
 */
export function CoucouLogo({
  width = 120,
}: CoucouLogoProps): React.JSX.Element {
  return <LogoSvg width={width} />;
}
