import { Page, View, Text, Svg, Circle } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { BrutalGrid } from './brutal-grid';
import { MetricHero } from './metric-hero';
import { PageFooter } from './page-footer';
import { PlatformRow } from './platform-row';
import { ScoreCircle } from './score-circle';
import { SectionHeader } from './section-header';

interface ExternalPresenceProps {
  externalPresence: AuditAnalysis['externalPresence'];
}

export function ExternalPresence({
  externalPresence,
}: ExternalPresenceProps): React.JSX.Element {
  const sortedPlatforms = [...externalPresence.platforms].sort(
    (a, b) => (b.found ? 1 : 0) - (a.found ? 1 : 0),
  );

  return (
    <Page size="A4" style={baseStyles.page} wrap>
      {/* Grille technique */}
      <BrutalGrid variant="subtle" />

      {/* Section Title */}
      <SectionHeader title="PRÉSENCE EXTERNE" />

      {/* Metric Hero - Score */}
      <MetricHero
        value={externalPresence.score}
        label="SCORE PRÉSENCE"
        variant="accent"
      />

      {/* Intro - monospace */}
      <Text
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.sm,
          color: theme.colors.textMuted,
          lineHeight: 1.5,
          marginBottom: 20,
          width: '80%',
        }}
      >
        Les moteurs de recherche IA construisent leur connaissance d'une marque à
        partir de sources publiques.
      </Text>

      {/* Table header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 6,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.sm,
            fontWeight: 700,
            color: theme.colors.textMuted,
            width: 120,
          }}
        >
          Plateforme
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.sm,
            fontWeight: 700,
            color: theme.colors.textMuted,
            flex: 1,
          }}
        >
          Statut
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSize.sm,
            fontWeight: 700,
            color: theme.colors.textMuted,
            width: 100,
            textAlign: 'right',
          }}
        >
          Impact
        </Text>
      </View>

      {/* Divider */}
      <View style={baseStyles.divider} />

      {/* Platform rows */}
      {sortedPlatforms.length > 0 ? (
        sortedPlatforms.map((platform) => (
          <PlatformRow key={platform.platform} platform={platform} />
        ))
      ) : (
        <View
          style={{
            backgroundColor: theme.colors.bgCard,
            padding: 20,
            marginTop: 12,
          }}
        >
          <Text
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize.base,
              color: theme.colors.textMuted,
              textAlign: 'center',
            }}
          >
            Aucune plateforme externe analysée.
          </Text>
        </View>
      )}

      {/* Gaps critiques card */}
      {externalPresence.gaps.length > 0 && (
        <View
          style={{
            ...baseStyles.card,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.destructive,
            marginTop: 20,
          }}
          wrap={false}
        >
          <Text
            style={{
              fontFamily: theme.fonts.display,
              fontSize: theme.fontSize.lg,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              marginBottom: 8,
            }}
          >
            Gaps critiques
          </Text>
          {externalPresence.gaps.map((gap, i) => (
            <View
              key={`gap-${i}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
              }}
            >
              <Svg width={8} height={8} viewBox="0 0 8 8">
                <Circle
                  cx={4}
                  cy={4}
                  r={4}
                  style={{ fill: theme.colors.destructive }}
                />
              </Svg>
              <Text
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSize.base,
                  color: theme.colors.textPrimary,
                  marginLeft: 8,
                  flex: 1,
                }}
              >
                {gap}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <PageFooter section="PRÉSENCE EXTERNE" />
    </Page>
  );
}
