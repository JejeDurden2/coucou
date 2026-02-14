import { Image } from '@react-pdf/renderer';

import { LOGO_BASE64 } from '../assets/logo';

interface CoucouLogoProps {
  width?: number;
}

export function CoucouLogo({
  width = 120,
}: CoucouLogoProps): React.JSX.Element {
  return <Image src={LOGO_BASE64} style={{ width }} />;
}
