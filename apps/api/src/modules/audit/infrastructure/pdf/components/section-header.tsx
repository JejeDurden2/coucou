import { View, Text } from '@react-pdf/renderer';

import { theme } from '../theme';

interface SectionHeaderProps {
  title: string;
  align?: 'left' | 'right';
}

/**
 * SectionHeader - En-tête de section standardisé
 *
 * Petit titre uppercase monospace, aligné à droite par défaut (convention brutalist).
 * Crée une hiérarchie visuelle inverse par rapport aux conventions traditionnelles.
 *
 * @param title - Texte du titre (en MAJUSCULES recommandé)
 * @param align - Alignement : 'left' | 'right' (default: 'right')
 *
 * @example
 * ```tsx
 * <SectionHeader title="RÉSUMÉ EXÉCUTIF" />
 * <SectionHeader title="AUDIT TECHNIQUE" align="left" />
 * ```
 */
export function SectionHeader({
  title,
  align = 'right',
}: SectionHeaderProps): React.JSX.Element {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        marginBottom: 24,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.sm,
          fontWeight: 700,
          color: theme.colors.textMuted,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
    </View>
  );
}
