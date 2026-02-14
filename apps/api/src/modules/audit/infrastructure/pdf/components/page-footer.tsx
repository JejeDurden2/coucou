import { View, Text } from '@react-pdf/renderer';

import { theme, baseStyles } from '../theme';

interface PageFooterProps {
  left: string;
  right: string;
}

/**
 * PageFooter - Footer standardisé pour toutes les pages
 *
 * Affiche un footer fixe en bas avec texte left/right aligné.
 * Utilise mono font et tiny size pour cohérence brutalist.
 *
 * @param left - Texte aligné à gauche (généralement "COUCOU IA")
 * @param right - Texte aligné à droite (nom de section ou numéro de page)
 *
 * @example
 * ```tsx
 * <PageFooter left="COUCOU IA" right="02" />
 * <PageFooter left="COUCOU IA" right="AUDIT TECHNIQUE" />
 * ```
 */
export function PageFooter({
  left,
  right,
}: PageFooterProps): React.JSX.Element {
  return (
    <View style={baseStyles.footer} fixed>
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
        }}
      >
        {left}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
        }}
      >
        {right}
      </Text>
    </View>
  );
}
