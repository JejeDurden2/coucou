import { View, Text } from '@react-pdf/renderer';
import type { AnalysisCompetitor } from '@coucou-ia/shared';

import { theme, baseStyles } from '../theme';

interface CompetitorCardProps {
  competitor: AnalysisCompetitor;
}

/**
 * CompetitorCard - Carte de concurrent avec analyse
 *
 * Affiche un concurrent avec name, domain, strengths, clientGaps, et externalPresenceAdvantage.
 * Layout card standard avec sections colorées par type d'information.
 *
 * @param competitor - Concurrent avec name, domain, strengths, clientGaps, externalPresenceAdvantage
 *
 * @example
 * ```tsx
 * <CompetitorCard competitor={{
 *   name: 'Concurrent A',
 *   domain: 'concurrent-a.com',
 *   estimatedGeoScore: 75,
 *   strengths: ['SEO mature', 'Contenu riche'],
 *   clientGaps: ['Manque de blog', 'Pas de FAQ'],
 *   externalPresenceAdvantage: ['Active sur LinkedIn', 'Guest blogging régulier']
 * }} />
 * ```
 */
export function CompetitorCard({
  competitor,
}: CompetitorCardProps): React.JSX.Element {
  return (
    <View style={baseStyles.card} wrap={false}>
      {/* Name + domain */}
      <Text
        style={{
          fontFamily: theme.fonts.display,
          fontSize: theme.fontSize.lg,
          fontWeight: 700,
          color: theme.colors.textPrimary,
          marginBottom: 2,
        }}
      >
        {competitor.name}
      </Text>
      <Text
        style={{
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSize.sm,
          color: theme.colors.textMuted,
          marginBottom: 12,
        }}
      >
        {competitor.domain}
      </Text>

      {/* Forces */}
      {competitor.strengths.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSize.sm,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Forces
          </Text>
          {competitor.strengths.map((s, i) => (
            <Text
              key={`s-${i}`}
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textPrimary,
                marginBottom: 2,
              }}
            >
              <Text style={{ color: theme.colors.accent }}>{'> '}</Text>
              {s}
            </Text>
          ))}
        </View>
      )}

      {/* Gaps exploitables */}
      {competitor.clientGaps.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSize.sm,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Gaps exploitables
          </Text>
          {competitor.clientGaps.map((g, i) => (
            <Text
              key={`g-${i}`}
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textPrimary,
                marginBottom: 2,
              }}
            >
              <Text style={{ color: theme.colors.success }}>{'> '}</Text>
              {g}
            </Text>
          ))}
        </View>
      )}

      {/* Avantages présence externe */}
      {competitor.externalPresenceAdvantage.length > 0 && (
        <View>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSize.sm,
              fontWeight: 700,
              color: theme.colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Avantages présence externe
          </Text>
          {competitor.externalPresenceAdvantage.map((a, i) => (
            <Text
              key={`a-${i}`}
              style={{
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSize.sm,
                color: theme.colors.textPrimary,
                marginBottom: 2,
              }}
            >
              <Text style={{ color: theme.colors.warning }}>{'! '}</Text>
              {a}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
