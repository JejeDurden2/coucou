import { View, Text } from '@react-pdf/renderer';

import { theme } from '../theme';

interface DataSlabProps {
  label: string;
  value: string | number;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'accent' | 'black' | 'transparent';
  overflow?: boolean; // Déborde intentionnellement du container
}

/**
 * DataSlab - Élément signature brutalist
 *
 * Bloc massif de typographie monospace qui écrase visuellement la page.
 * Crée une tension visuelle entre densité extrême et vides brutaux.
 */
export function DataSlab({
  label,
  value,
  orientation = 'horizontal',
  variant = 'accent',
  overflow = false,
}: DataSlabProps): React.JSX.Element {
  const backgroundColor =
    variant === 'accent'
      ? theme.colors.accent
      : variant === 'black'
        ? theme.colors.brutalBlack
        : 'transparent';

  const containerStyle = {
    backgroundColor,
    padding: orientation === 'horizontal' ? 16 : 24,
    marginHorizontal: overflow ? -20 : 0, // Déborde de 20px de chaque côté
  };

  if (orientation === 'vertical') {
    return (
      <View style={containerStyle}>
        <View
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize.sm,
              fontWeight: 700,
              color: theme.colors.brutalWhite,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize['6xl'],
              fontWeight: 700,
              color: theme.colors.brutalWhite,
              lineHeight: 0.9,
              letterSpacing: -2,
            }}
          >
            {value}
          </Text>
        </View>
      </View>
    );
  }

  // Horizontal orientation (default)
  return (
    <View style={containerStyle}>
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.tiny,
          fontWeight: 700,
          color: theme.colors.brutalWhite,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 4,
          opacity: 0.7,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize['5xl'],
          fontWeight: 700,
          color: theme.colors.brutalWhite,
          lineHeight: 1,
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
