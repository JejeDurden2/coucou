import { View, Text } from '@react-pdf/renderer';

import { theme, baseStyles } from '../theme';

/**
 * PageFooter - Footer standardisé pour toutes les pages
 *
 * Affiche un footer fixe en bas avec :
 * - Ligne séparatrice 0.5pt
 * - "COUCOU IA" à gauche
 * - Numéro de page dynamique à droite (format "01", "02", etc.)
 *
 * @example
 * ```tsx
 * <PageFooter />
 * ```
 */
export function PageFooter(): React.JSX.Element {
  return (
    <View style={baseStyles.footer} fixed>
      <View
        style={{
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.border,
          marginBottom: 4,
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 7,
          }}
        >
          COUCOU IA
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 7,
          }}
          render={({ pageNumber }) => String(pageNumber).padStart(2, '0')}
        />
      </View>
    </View>
  );
}
