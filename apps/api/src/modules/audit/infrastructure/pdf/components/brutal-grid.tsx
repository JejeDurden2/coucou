import { Svg, Line } from '@react-pdf/renderer';
import { View } from '@react-pdf/renderer';

import { theme } from '../theme';

interface BrutalGridProps {
  columns?: number; // Nombre de colonnes (default: 6, optimized for performance)
  rows?: number; // Nombre de lignes (default: 10, optimized for performance)
  variant?: 'subtle' | 'heavy'; // Intensité des lignes
  showVertical?: boolean;
  showHorizontal?: boolean;
}

/**
 * BrutalGrid - Grille technique visible
 *
 * Affiche une grille technique proéminente en arrière-plan.
 * Les éléments peuvent intentionnellement casser cette grille pour créer de la tension.
 *
 * Performance: Reduced from 12x20 to 6x10 grid for ~42% fewer SVG elements
 */
export function BrutalGrid({
  columns = 6,
  rows = 10,
  variant = 'subtle',
  showVertical = true,
  showHorizontal = true,
}: BrutalGridProps): React.JSX.Element {
  const strokeColor =
    variant === 'heavy' ? theme.colors.gridLineHeavy : theme.colors.gridLine;
  const strokeWidth = variant === 'heavy' ? 0.5 : 0.25;

  // A4 dimensions: 595 x 842 pts (avec marges de 40px)
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;

  const contentWidth = pageWidth - 2 * margin;
  const contentHeight = pageHeight - 2 * margin;

  // Calcul des espacements
  const columnWidth = contentWidth / columns;
  const rowHeight = contentHeight / rows;

  return (
    <View
      fixed
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Svg width={pageWidth} height={pageHeight} viewBox={`0 0 ${pageWidth} ${pageHeight}`}>
        {/* Lignes verticales (colonnes) */}
        {showVertical &&
          Array.from({ length: columns + 1 }).map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={margin + i * columnWidth}
              y1={margin}
              x2={margin + i * columnWidth}
              y2={pageHeight - margin}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={0.3}
            />
          ))}

        {/* Lignes horizontales (baseline grid) */}
        {showHorizontal &&
          Array.from({ length: rows + 1 }).map((_, i) => (
            <Line
              key={`h-${i}`}
              x1={margin}
              y1={margin + i * rowHeight}
              x2={pageWidth - margin}
              y2={margin + i * rowHeight}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={0.3}
            />
          ))}

        {/* Bordure extérieure plus marquée */}
        <Line
          x1={margin}
          y1={margin}
          x2={pageWidth - margin}
          y2={margin}
          stroke={strokeColor}
          strokeWidth={strokeWidth * 2}
          opacity={0.5}
        />
        <Line
          x1={margin}
          y1={pageHeight - margin}
          x2={pageWidth - margin}
          y2={pageHeight - margin}
          stroke={strokeColor}
          strokeWidth={strokeWidth * 2}
          opacity={0.5}
        />
        <Line
          x1={margin}
          y1={margin}
          x2={margin}
          y2={pageHeight - margin}
          stroke={strokeColor}
          strokeWidth={strokeWidth * 2}
          opacity={0.5}
        />
        <Line
          x1={pageWidth - margin}
          y1={margin}
          x2={pageWidth - margin}
          y2={pageHeight - margin}
          stroke={strokeColor}
          strokeWidth={strokeWidth * 2}
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}
