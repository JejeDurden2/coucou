import { Svg, Polygon, Line, Circle, Text as SvgText } from '@react-pdf/renderer';

import { COLORS } from '../styles';

interface RadarChartProps {
  scores: {
    structure: number;
    content: number;
    technical: number;
    competitive: number;
  };
  size?: number;
}

const AXES = [
  { key: 'structure' as const, label: 'Structure', angle: -90 },
  { key: 'content' as const, label: 'Contenu', angle: 0 },
  { key: 'technical' as const, label: 'Technique', angle: 90 },
  { key: 'competitive' as const, label: 'Concurrence', angle: 180 },
];

const GRID_LEVELS = [25, 50, 75, 100];

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function getPoint(
  center: number,
  radius: number,
  angle: number,
  value: number,
): { x: number; y: number } {
  const r = (value / 100) * radius;
  return {
    x: center + r * Math.cos(toRadians(angle)),
    y: center + r * Math.sin(toRadians(angle)),
  };
}

export function RadarChart({
  scores,
  size = 200,
}: RadarChartProps): React.JSX.Element {
  const center = size / 2;
  const radius = size / 2 - 30;

  const dataPoints = AXES.map((axis) =>
    getPoint(center, radius, axis.angle, scores[axis.key]),
  );
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid polygons */}
      {GRID_LEVELS.map((level) => {
        const points = AXES.map((axis) =>
          getPoint(center, radius, axis.angle, level),
        )
          .map((p) => `${p.x},${p.y}`)
          .join(' ');
        return (
          <Polygon
            key={`grid-${level}`}
            points={points}
            style={{
              fill: 'none',
              stroke: '#2D2640',
              strokeWidth: 0.5,
            }}
          />
        );
      })}

      {/* Axis lines */}
      {AXES.map((axis) => {
        const end = getPoint(center, radius, axis.angle, 100);
        return (
          <Line
            key={`axis-${axis.key}`}
            x1={center}
            y1={center}
            x2={end.x}
            y2={end.y}
            style={{ stroke: '#2D2640', strokeWidth: 0.5 }}
          />
        );
      })}

      {/* Data polygon */}
      <Polygon
        points={polygonPoints}
        style={{
          fill: COLORS.purple,
          fillOpacity: 0.3,
          stroke: COLORS.purple,
          strokeWidth: 2,
        }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <Circle
          key={`point-${AXES[i].key}`}
          cx={p.x}
          cy={p.y}
          r={3}
          style={{ fill: COLORS.purple }}
        />
      ))}

      {/* Labels */}
      {AXES.map((axis) => {
        const labelPoint = getPoint(center, radius, axis.angle, 118);
        return (
          <SvgText
            key={`label-${axis.key}`}
            x={labelPoint.x}
            y={labelPoint.y}
            style={{
              fontSize: 7,
              fill: COLORS.gray300,
              textAnchor: 'middle',
            }}
          >
            {`${axis.label} (${scores[axis.key]})`}
          </SvgText>
        );
      })}
    </Svg>
  );
}
