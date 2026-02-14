import { Page, View, Text, Svg, Circle } from '@react-pdf/renderer';
import type { AuditAnalysis } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';
import { ScoreCircle } from './score-circle';
import { PlatformRow } from './platform-row';

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
      {/* Section Title */}
      <Text style={baseStyles.sectionTitle}>
        Présence Externe — Signaux de Confiance IA
      </Text>

      {/* Intro paragraph */}
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.base,
          color: theme.colors.textMuted,
          lineHeight: 1.6,
          marginBottom: 16,
        }}
      >
        Les moteurs de recherche IA construisent leur connaissance d'une marque à
        partir de sources publiques. Plus votre marque est présente et bien notée
        sur ces plateformes, plus les IA la citent dans leurs réponses.
      </Text>

      {/* Score */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <ScoreCircle
          score={externalPresence.score}
          size="medium"
          label="Présence externe"
        />
      </View>

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
      {sortedPlatforms.map((platform) => (
        <PlatformRow key={platform.platform} platform={platform} />
      ))}

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
      <View style={baseStyles.footer} fixed>
        <Text>Coucou IA</Text>
        <Text>Présence Externe</Text>
      </View>
    </Page>
  );
}
