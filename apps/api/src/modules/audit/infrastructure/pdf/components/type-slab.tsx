import { View, Text } from '@react-pdf/renderer';

import { theme } from '../theme';

interface TypeSlabProps {
  text: string;
  size?: 'massive' | 'large' | 'medium';
  align?: 'left' | 'right' | 'center';
  overflow?: boolean; // Déborde intentionnellement
}

/**
 * TypeSlab - Typographie architecturale
 *
 * Typographie massive utilisée comme élément structurel.
 * Crée une tension visuelle et établit la hiérarchie brutale.
 */
export function TypeSlab({
  text,
  size = 'large',
  align = 'left',
  overflow = false,
}: TypeSlabProps): React.JSX.Element {
  const fontSize =
    size === 'massive'
      ? theme.fontSize['7xl']
      : size === 'large'
        ? theme.fontSize['6xl']
        : theme.fontSize['5xl'];

  const letterSpacing = size === 'massive' ? -3 : size === 'large' ? -2 : -1;

  return (
    <View
      style={{
        marginHorizontal: overflow ? -20 : 0,
        marginVertical: 8,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          lineHeight: 0.9,
          letterSpacing,
          textAlign: align,
          textTransform: 'uppercase',
        }}
      >
        {text}
      </Text>
    </View>
  );
}
