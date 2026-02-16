import { View, Text } from '@react-pdf/renderer';

import { theme, baseStyles } from '../theme';
import { CoucouLogo } from './coucou-logo';

interface PageFooterProps {
  section?: string;
}

/**
 * PageFooter - Footer standardisé pour toutes les pages
 *
 * Affiche un footer fixe en bas avec :
 * - Ligne séparatrice 0.5pt
 * - "COUCOU IA" à gauche
 * - Numéro de page dynamique à droite (format "SECTION — 02" ou "02")
 *
 * @example
 * ```tsx
 * <PageFooter section="RÉSUMÉ EXÉCUTIF" />
 * ```
 */
export function PageFooter({ section }: PageFooterProps): React.JSX.Element {
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
        <CoucouLogo width={14} />
        <Text
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 7,
          }}
          render={({ pageNumber }) => {
            const num = String(pageNumber).padStart(2, '0');
            return section ? `${section} — ${num}` : num;
          }}
        />
      </View>
    </View>
  );
}
